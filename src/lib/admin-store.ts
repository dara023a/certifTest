import { useSyncExternalStore } from "react";

import { certificates as seedCertificates } from "./data";
import {
  Certificate,
  CertificateType,
  ORGANIZATION,
  Template,
  VerificationLog,
  VerificationResult,
  VerificationSource,
} from "./types";

export const ADMIN_SCHEMA_VERSION = 2;
const STORAGE_KEY = "lexa-admin-store";
const MAX_LOGS = 500;
const MAX_LOG_ID_LENGTH = 64;

/**
 * Schema v1 used short demo IDs (`WEB-2026-001`). v2 standardises on the
 * generated `LEXA-*` format. Existing user data is migrated, not discarded.
 */
const LEGACY_CERTIFICATE_ID_MAP: Record<string, string> = {
  "WEB-2026-001": "LEXA-WBNR-2026-001",
  "WEB-2026-002": "LEXA-WBNR-2026-002",
  "INT-2026-001": "LEXA-INTR-2026-001",
};

export interface AdminData {
  version: number;
  certificates: Certificate[];
  templates: Template[];
  logs: VerificationLog[];
}

export const EMPTY_ADMIN_DATA: AdminData = {
  version: ADMIN_SCHEMA_VERSION,
  certificates: [],
  templates: [],
  logs: [],
};

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

/** Exposes a client-side unique id generator for new entities. */
export function newId(): string {
  return uid();
}

function defaultTemplates(): Template[] {
  return [
    {
      id: "tpl-webinar-default",
      name: "Template Webinar LEXA",
      type: "webinar",
      issuer: ORGANIZATION.name,
      signerName: "Rangga Wibawa",
      signerTitle: "Head of Learning",
      accentColor: "#2562f9",
      createdAt: "2026-01-05",
    },
    {
      id: "tpl-internship-default",
      name: "Template Magang LEXA",
      type: "internship",
      issuer: ORGANIZATION.name,
      signerName: "Rangga Wibawa",
      signerTitle: "Head of People",
      accentColor: "#242cab",
      createdAt: "2026-01-05",
    },
  ];
}

function demoTemplatesFor(type: CertificateType): string {
  return type === "webinar" ? "tpl-webinar-default" : "tpl-internship-default";
}

function demoLogs(): VerificationLog[] {
  const now = Date.now();
  const day = 86_400_000;
  const rows: Array<[number, string, VerificationResult, VerificationSource]> = [
    [0, "LEXA-WBNR-2026-001", "valid", "qr"],
    [0, "LEXA-INTR-2026-001", "valid", "manual"],
    [0, "LEXA-WBNR-2026-999", "not_found", "link"],
    [1, "LEXA-WBNR-2026-002", "revoked", "link"],
    [1, "LEXA-WBNR-2026-001", "valid", "link"],
    [2, "LEXA-INTR-2026-001", "valid", "qr"],
    [3, "LEXA-WBNR-2026-001", "valid", "manual"],
    [3, "LEXA-WBNR-2026-002", "revoked", "qr"],
    [4, "LEXA-WBNR-2026-001", "valid", "link"],
    [5, "LEXA-INTR-2026-001", "valid", "manual"],
    [6, "LEXA-WBNR-2026-001", "valid", "link"],
  ];
  return rows.map(([daysAgo, certificateId, result, source], index) => ({
    id: `log-seed-${index}`,
    timestamp: new Date(now - daysAgo * day - (index % 5) * 3_600_000).toISOString(),
    certificateId,
    result,
    source,
  }));
}

function seedData(): AdminData {
  const templates = defaultTemplates();
  const certificates: Certificate[] = seedCertificates.map((certificate) => ({
    ...certificate,
    templateId: demoTemplatesFor(certificate.type),
  }));
  return {
    version: ADMIN_SCHEMA_VERSION,
    certificates,
    templates,
    logs: demoLogs(),
  };
}

let cache: AdminData | null = null;
let lastRaw: string | null = null;
const listeners = new Set<() => void>();
const storageErrorListeners = new Set<() => void>();

/** Notifies subscribers when a write to `localStorage` fails (quota/private mode). */
export function subscribeStorageError(callback: () => void): () => void {
  storageErrorListeners.add(callback);
  return () => {
    storageErrorListeners.delete(callback);
  };
}

function emitStorageError(): void {
  for (const listener of storageErrorListeners) {
    listener();
  }
}

/**
 * Upgrades stored data to the current schema without discarding user changes.
 * Unknown/future versions keep their fields as-is (only `version` is updated).
 */
function migrate(data: AdminData): AdminData {
  let next: AdminData = {
    ...EMPTY_ADMIN_DATA,
    ...data,
    version: ADMIN_SCHEMA_VERSION,
  };

  if (typeof data.version !== "number" || data.version < 2) {
    next = {
      ...next,
      certificates: next.certificates.map((certificate) => ({
        ...certificate,
        certificateId:
          LEGACY_CERTIFICATE_ID_MAP[certificate.certificateId] ??
          certificate.certificateId,
      })),
      logs: next.logs.map((log) => ({
        ...log,
        certificateId: (
          LEGACY_CERTIFICATE_ID_MAP[log.certificateId] ?? log.certificateId
        ).slice(0, MAX_LOG_ID_LENGTH),
      })),
    };
  } else {
    next = {
      ...next,
      logs: next.logs.map((log) => ({
        ...log,
        certificateId: log.certificateId.slice(0, MAX_LOG_ID_LENGTH),
      })),
    };
  }

  return next;
}

function read(): AdminData {
  if (typeof window === "undefined") {
    return EMPTY_ADMIN_DATA;
  }

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (cache && raw === lastRaw) {
    return cache;
  }

  if (raw) {
    let parsed: AdminData | null = null;
    try {
      parsed = JSON.parse(raw) as AdminData;
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === "object" && typeof parsed.version === "number") {
      // Migrate rather than silently reseeding when the schema version changed.
      const migrated = migrate(parsed);
      cache = migrated;
      const serialized = JSON.stringify(migrated);
      if (serialized !== raw) {
        try {
          window.localStorage.setItem(STORAGE_KEY, serialized);
          lastRaw = serialized;
        } catch {
          lastRaw = raw;
        }
      } else {
        lastRaw = raw;
      }
      return migrated;
    }

    // Unreadable/foreign shape cannot be migrated — reseed with a warning.
    console.warn("[admin-store] Stored data is unreadable; reseeding demo data.");
  }

  const seeded = seedData();
  cache = seeded;
  try {
    const serialized = JSON.stringify(seeded);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    lastRaw = serialized;
  } catch {
    lastRaw = null;
  }
  return seeded;
}

export function getAdminSnapshot(): AdminData {
  return read();
}

export function getAdminServerSnapshot(): AdminData {
  return EMPTY_ADMIN_DATA;
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeAdminStore(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = () => {
    cache = null;
    emit();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function persist(next: AdminData): void {
  cache = next;
  try {
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    lastRaw = serialized;
  } catch {
    lastRaw = null;
    emitStorageError();
  }
  emit();
}

export function updateAdminData(updater: (data: AdminData) => AdminData): void {
  persist(updater(read()));
}

/** Case-insensitive lookup against the client-side store (used by public verify). */
export function findCertificateInStore(certificateId: string): Certificate | undefined {
  const key = certificateId.trim().toLowerCase();
  return read().certificates.find(
    (certificate) => certificate.certificateId.toLowerCase() === key
  );
}

/** Generates `LEXA-<WBNR|INTR>-<year>-<seq>` based on existing certificates. */
export function generateCertificateId(
  type: CertificateType,
  list: Certificate[]
): string {
  const prefix = type === "webinar" ? "WBNR" : "INTR";
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^LEXA-${prefix}-${year}-(\\d{1,3})$`, "i");
  let max = 0;
  for (const certificate of list) {
    const match = pattern.exec(certificate.certificateId);
    if (match) {
      max = Math.max(max, Number.parseInt(match[1], 10));
    }
  }
  return `LEXA-${prefix}-${year}-${String(max + 1).padStart(3, "0")}`;
}

export function isCertificateIdTaken(
  certificateId: string,
  list: Certificate[],
  ignoreId?: string
): boolean {
  const key = certificateId.trim().toLowerCase();
  return list.some(
    (certificate) =>
      certificate.id !== ignoreId &&
      certificate.certificateId.toLowerCase() === key
  );
}

export const adminActions = {
  addCertificate(certificate: Certificate): void {
    updateAdminData((data) => ({
      ...data,
      certificates: [certificate, ...data.certificates],
    }));
  },
  updateCertificate(certificate: Certificate): void {
    updateAdminData((data) => ({
      ...data,
      certificates: data.certificates.map((item) =>
        item.id === certificate.id ? certificate : item
      ),
    }));
  },
  deleteCertificate(id: string): void {
    updateAdminData((data) => ({
      ...data,
      certificates: data.certificates.filter((item) => item.id !== id),
    }));
  },
  setCertificateStatus(id: string, status: "valid" | "revoked"): void {
    updateAdminData((data) => ({
      ...data,
      certificates: data.certificates.map((item) =>
        item.id === id ? ({ ...item, status } as Certificate) : item
      ),
    }));
  },
  addTemplate(template: Template): void {
    updateAdminData((data) => ({
      ...data,
      templates: [template, ...data.templates],
    }));
  },
  updateTemplate(template: Template): void {
    updateAdminData((data) => ({
      ...data,
      templates: data.templates.map((item) =>
        item.id === template.id ? template : item
      ),
    }));
  },
  deleteTemplate(id: string): void {
    updateAdminData((data) => ({
      ...data,
      templates: data.templates.filter((item) => item.id !== id),
    }));
  },
  addLog(entry: VerificationLog): void {
    const normalized: VerificationLog = {
      ...entry,
      certificateId: entry.certificateId.slice(0, MAX_LOG_ID_LENGTH),
    };
    updateAdminData((data) => ({
      ...data,
      logs: [normalized, ...data.logs].slice(0, MAX_LOGS),
    }));
  },
  clearLogs(): void {
    updateAdminData((data) => ({ ...data, logs: [] }));
  },
  resetDemoData(): void {
    persist(seedData());
  },
};

const alwaysTrue = () => true;
const alwaysFalse = () => false;

/**
 * Reads the client-side admin store. Data lives in `localStorage`; nothing is
 * sent to a server. Replace with Supabase queries before production.
 */
export function useAdminStore() {
  const data = useSyncExternalStore(
    subscribeAdminStore,
    getAdminSnapshot,
    getAdminServerSnapshot
  );
  const ready = useSyncExternalStore(
    subscribeAdminStore,
    alwaysTrue,
    alwaysFalse
  );

  return { ...data, ready, actions: adminActions };
}
