"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ShieldQuestion } from "lucide-react";

import { CertificatePreviewCard } from "@/components/certificate-preview-card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";
import { newId, useAdminStore } from "@/lib/admin-store";
import { translations } from "@/lib/i18n";
import type { Certificate, VerificationSource } from "@/lib/types";

interface CertificateVerifyViewProps {
  certificateId: string;
  /**
   * Certificate found by the server in the static demo dataset. Admin-created
   * certificates are not available on the server (they live in the browser), so
   * this is `null` and the lookup is resolved on the client instead.
   */
  initialCertificate: Certificate | null;
}

function readSource(): VerificationSource {
  if (typeof window === "undefined") {
    return "link";
  }
  const value = new URLSearchParams(window.location.search).get("src");
  if (value === "qr" || value === "manual") {
    return value;
  }
  return "link";
}

export function CertificateVerifyView({
  certificateId,
  initialCertificate,
}: CertificateVerifyViewProps) {
  const { language } = useSettings();
  const t = translations[language];
  const { certificates, ready, actions } = useAdminStore();
  const logged = useRef(false);

  const key = certificateId.trim().toLowerCase();
  const certificate =
    initialCertificate ??
    (ready
      ? certificates.find((item) => item.certificateId.toLowerCase() === key)
      : undefined);

  // Record the visit once the store is available on the client.
  useEffect(() => {
    if (!ready || logged.current) return;
    logged.current = true;
    actions.addLog({
      id: newId(),
      timestamp: new Date().toISOString(),
      certificateId,
      result: certificate ? certificate.status : "not_found",
      source: readSource(),
    });
  }, [ready, certificate, certificateId, actions]);

  if (certificate) {
    return <CertificatePreviewCard certificate={certificate} />;
  }

  if (!ready && !initialCertificate) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6" role="status" aria-live="polite">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
        <span className="sr-only">{t.admin.common.loading}</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-xl border border-border bg-card p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldQuestion className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-lg font-semibold tracking-tight">{t.notFoundTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.notFoundDesc(certificateId)}
      </p>
      <Button asChild className="mt-6">
        <Link href="/">{t.backHome}</Link>
      </Button>
    </div>
  );
}
