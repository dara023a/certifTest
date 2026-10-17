"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/page-header";
import { useToast } from "@/components/admin/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/settings-context";
import {
  adminActions,
  generateCertificateId,
  isCertificateIdTaken,
  newId,
  useAdminStore,
} from "@/lib/admin-store";
import { todayLocalISODate } from "@/lib/admin-format";
import { translations } from "@/lib/i18n";
import { isWinAnsi } from "@/lib/text";
import type { Certificate, CertificateType } from "@/lib/types";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 disabled:cursor-not-allowed disabled:opacity-60 [@media(pointer:coarse)]:h-11";

type ErrorCode =
  | "required"
  | "idFormat"
  | "idTaken"
  | "idType"
  | "tooLong"
  | "invalidChars"
  | "invalid";

interface FieldError {
  code: ErrorCode;
  max?: number;
}

interface FormState {
  type: CertificateType;
  templateId: string;
  certificateId: string;
  recipientName: string;
  issuer: string;
  issuanceDate: string;
  eventTitle: string;
  speaker: string;
  eventDate: string;
  position: string;
  department: string;
  internshipPeriod: string;
}

/** Per-field character limits shared by validation and the inputs. */
const MAX = {
  recipientName: 60,
  issuer: 60,
  eventTitle: 120,
  speaker: 60,
  position: 60,
  department: 60,
  internshipPeriod: 60,
} as const;

interface Messages {
  required: string;
  idFormat: string;
  idType: string;
  invalidChars: string;
  tooLong: (max: number) => string;
}

const idPattern = /^LEXA-(WBNR|INTR)-\d{4}-\d{3}$/i;
const webinarPrefix = /^LEXA-WBNR-/i;
const internshipPrefix = /^LEXA-INTR-/i;

function createSchema(messages: Messages, mode: "create" | "edit") {
  return z
    .object({
      type: z.enum(["webinar", "internship"]),
      templateId: z.string().trim().min(1, messages.required),
      certificateId: z.string().trim().min(1, messages.required),
      recipientName: z.string().trim().min(1, messages.required),
      issuer: z.string().trim().min(1, messages.required),
      issuanceDate: z.string().min(1, messages.required),
      eventTitle: z.string().trim().optional(),
      speaker: z.string().trim().optional(),
      eventDate: z.string().optional(),
      position: z.string().trim().optional(),
      department: z.string().trim().optional(),
      internshipPeriod: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      const issue = (key: string, message: string) =>
        ctx.addIssue({ code: "custom", path: [key], message });
      const require = (key: string, value: string | undefined) => {
        if (!value) issue(key, messages.required);
      };
      const checkLength = (key: string, value: string | undefined, max: number) => {
        if (value && value.length > max) issue(key, messages.tooLong(max));
      };
      const checkChars = (key: string, value: string | undefined) => {
        if (value && !isWinAnsi(value)) issue(key, messages.invalidChars);
      };

      // ID format is only enforced when creating. On edit the ID is read-only so
      // legacy/seed IDs keep working while the permanent link stays valid.
      if (mode === "create") {
        if (!idPattern.test(data.certificateId)) {
          issue("certificateId", messages.idFormat);
        } else {
          const matches =
            data.type === "webinar"
              ? webinarPrefix.test(data.certificateId)
              : internshipPrefix.test(data.certificateId);
          if (!matches) issue("certificateId", messages.idType);
        }
      }

      checkLength("recipientName", data.recipientName, MAX.recipientName);
      checkChars("recipientName", data.recipientName);
      checkLength("issuer", data.issuer, MAX.issuer);
      checkChars("issuer", data.issuer);

      if (data.type === "webinar") {
        require("eventTitle", data.eventTitle);
        require("speaker", data.speaker);
        require("eventDate", data.eventDate);
        checkLength("eventTitle", data.eventTitle, MAX.eventTitle);
        checkChars("eventTitle", data.eventTitle);
        checkLength("speaker", data.speaker, MAX.speaker);
        checkChars("speaker", data.speaker);
      } else {
        require("position", data.position);
        require("department", data.department);
        require("internshipPeriod", data.internshipPeriod);
        checkLength("position", data.position, MAX.position);
        checkChars("position", data.position);
        checkLength("department", data.department, MAX.department);
        checkChars("department", data.department);
        checkLength("internshipPeriod", data.internshipPeriod, MAX.internshipPeriod);
        checkChars("internshipPeriod", data.internshipPeriod);
      }
    });
}

function toFieldError(message: string, messages: Messages): FieldError {
  if (message === messages.idFormat) return { code: "idFormat" };
  if (message === messages.idType) return { code: "idType" };
  if (message === messages.invalidChars) return { code: "invalidChars" };
  if (message === messages.required) return { code: "required" };
  const max = Object.values(MAX).find((value) => message === messages.tooLong(value));
  if (max) return { code: "tooLong", max };
  return { code: "invalid" };
}

interface CertificateFormProps {
  mode: "create" | "edit";
  certificate?: Certificate;
  certificates: Certificate[];
}

export function CertificateForm({ mode, certificate, certificates }: CertificateFormProps) {
  const { language } = useSettings();
  const t = translations[language].admin;
  const { toast } = useToast();
  const router = useRouter();
  const { templates } = useAdminStore();

  const [form, setForm] = useState<FormState>(() => {
    const firstTemplate = (type: CertificateType) =>
      templates.find((template) => template.type === type)?.id ?? "";
    if (certificate) {
      return {
        type: certificate.type,
        templateId: certificate.templateId || firstTemplate(certificate.type),
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        issuer: certificate.issuer,
        issuanceDate: certificate.issuanceDate,
        eventTitle: certificate.type === "webinar" ? certificate.eventTitle : "",
        speaker: certificate.type === "webinar" ? certificate.speaker : "",
        eventDate: certificate.type === "webinar" ? certificate.eventDate : "",
        position: certificate.type === "internship" ? certificate.position : "",
        department: certificate.type === "internship" ? certificate.department : "",
        internshipPeriod:
          certificate.type === "internship" ? certificate.internshipPeriod : "",
      };
    }
    return {
      type: "webinar",
      templateId: firstTemplate("webinar"),
      certificateId: generateCertificateId("webinar", certificates),
      recipientName: "",
      issuer: "Lexa Technologies",
      issuanceDate: todayLocalISODate(),
      eventTitle: "",
      speaker: "",
      eventDate: "",
      position: "",
      department: "",
      internshipPeriod: "",
    };
  });

  const [errors, setErrors] = useState<Record<string, FieldError | undefined>>({});

  const templateList = useMemo(
    () => templates.filter((template) => template.type === form.type),
    [templates, form.type]
  );

  const isEdit = mode === "edit";
  const canSave = templateList.length > 0;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleTypeChange = (type: CertificateType) => {
    setForm((current) => ({
      ...current,
      type,
      templateId: templates.find((template) => template.type === type)?.id ?? "",
      certificateId:
        mode === "create"
          ? generateCertificateId(type, certificates)
          : current.certificateId,
    }));
    setErrors({});
  };

  const buildCertificate = (id: string, status: "valid" | "revoked"): Certificate => {
    if (form.type === "webinar") {
      return {
        id,
        certificateId: form.certificateId.trim(),
        type: "webinar",
        recipientName: form.recipientName.trim(),
        issuer: form.issuer.trim(),
        issuanceDate: form.issuanceDate,
        status,
        eventTitle: form.eventTitle.trim(),
        speaker: form.speaker.trim(),
        eventDate: form.eventDate,
        templateId: form.templateId,
      };
    }
    return {
      id,
      certificateId: form.certificateId.trim(),
      type: "internship",
      recipientName: form.recipientName.trim(),
      issuer: form.issuer.trim(),
      issuanceDate: form.issuanceDate,
      status,
      position: form.position.trim(),
      department: form.department.trim(),
      internshipPeriod: form.internshipPeriod.trim(),
      templateId: form.templateId,
    };
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    const messages: Messages = {
      required: t.certificates.error.required,
      idFormat: t.certificates.error.idFormat,
      idType: t.certificates.error.idType,
      invalidChars: t.certificates.error.invalidChars,
      tooLong: t.certificates.error.tooLong,
    };

    const result = createSchema(messages, mode).safeParse(form);

    if (!result.success) {
      const next: Record<string, FieldError> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (!key || next[key]) continue;
        next[key] = toFieldError(issue.message, messages);
      }
      setErrors(next);
      return;
    }

    if (isCertificateIdTaken(form.certificateId, certificates, certificate?.id)) {
      setErrors({ certificateId: { code: "idTaken" } });
      return;
    }

    if (mode === "create") {
      adminActions.addCertificate(buildCertificate(newId(), "valid"));
    } else if (certificate) {
      adminActions.updateCertificate(buildCertificate(certificate.id, certificate.status));
    }

    toast(t.certificates.saved, "success");
    router.push("/admin/certificates");
  };

  const errorText = (error: FieldError | undefined) => {
    if (!error) return null;
    const e = t.certificates.error;
    switch (error.code) {
      case "required":
        return e.required;
      case "idFormat":
        return e.idFormat;
      case "idTaken":
        return e.idTaken;
      case "idType":
        return e.idType;
      case "invalidChars":
        return e.invalidChars;
      case "tooLong":
        return e.tooLong(error.max ?? 0);
      default:
        return e.invalid;
    }
  };

  const showError = (key: string) => {
    const text = errorText(errors[key]);
    if (!text) return null;
    return (
      <p id={`${key}-error`} className="text-sm text-destructive">
        {text}
      </p>
    );
  };

  const fieldProps = (key: string) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <AdminPageHeader
        title={mode === "create" ? t.certificates.createTitle : t.certificates.editTitle}
        description={t.certificates.subtitle}
      />

      {!canSave && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>{t.certificates.noTemplateTitle}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{t.certificates.noTemplateDesc}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/templates">{t.certificates.manageTemplates}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
          <div className="space-y-1.5">
            <label htmlFor="type" className="text-sm font-medium">
              {t.certificates.field.type}
            </label>
            <select
              id="type"
              className={selectClass}
              value={form.type}
              disabled={isEdit}
              onChange={(event) => handleTypeChange(event.target.value as CertificateType)}
              {...fieldProps("type")}
            >
              <option value="webinar">{t.common.webinar}</option>
              <option value="internship">{t.common.internship}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="certificateId" className="text-sm font-medium">
              {t.certificates.field.certificateId}
            </label>
            <div className="flex gap-2">
              <Input
                id="certificateId"
                className="font-mono disabled:cursor-not-allowed disabled:opacity-60"
                value={form.certificateId}
                readOnly={isEdit}
                onChange={(event) => update("certificateId", event.target.value)}
                {...fieldProps("certificateId")}
              />
              {mode === "create" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() =>
                    update("certificateId", generateCertificateId(form.type, certificates))
                  }
                >
                  <Wand2 className="h-4 w-4" aria-hidden="true" />
                  {t.certificates.generateId}
                </Button>
              )}
            </div>
            {showError("certificateId")}
            {isEdit && (
              <p className="text-sm text-muted-foreground">{t.certificates.idLockedHint}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="recipientName" className="text-sm font-medium">
              {t.certificates.field.recipientName}
            </label>
            <Input
              id="recipientName"
              value={form.recipientName}
              maxLength={MAX.recipientName}
              onChange={(event) => update("recipientName", event.target.value)}
              {...fieldProps("recipientName")}
            />
            {showError("recipientName")}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="issuer" className="text-sm font-medium">
              {t.certificates.field.issuer}
            </label>
            <Input
              id="issuer"
              value={form.issuer}
              maxLength={MAX.issuer}
              onChange={(event) => update("issuer", event.target.value)}
              {...fieldProps("issuer")}
            />
            {showError("issuer")}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="issuanceDate" className="text-sm font-medium">
              {t.certificates.field.issuanceDate}
            </label>
            <Input
              id="issuanceDate"
              type="date"
              value={form.issuanceDate}
              onChange={(event) => update("issuanceDate", event.target.value)}
              {...fieldProps("issuanceDate")}
            />
            {showError("issuanceDate")}
          </div>
        </section>

        <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
          <div className="space-y-1.5">
            <label htmlFor="templateId" className="text-sm font-medium">
              {t.certificates.field.template}
            </label>
            <select
              id="templateId"
              className={selectClass}
              value={form.templateId}
              onChange={(event) => update("templateId", event.target.value)}
              {...fieldProps("templateId")}
            >
              <option value="">{t.common.selectTemplate}</option>
              {templateList.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {showError("templateId")}
            <p className="text-sm text-muted-foreground">{t.templates.todo}</p>
          </div>

          {form.type === "webinar" ? (
            <>
              <div className="space-y-1.5">
                <label htmlFor="eventTitle" className="text-sm font-medium">
                  {t.certificates.field.eventTitle}
                </label>
                <Input
                  id="eventTitle"
                  value={form.eventTitle}
                  maxLength={MAX.eventTitle}
                  onChange={(event) => update("eventTitle", event.target.value)}
                  {...fieldProps("eventTitle")}
                />
                {showError("eventTitle")}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="speaker" className="text-sm font-medium">
                  {t.certificates.field.speaker}
                </label>
                <Input
                  id="speaker"
                  value={form.speaker}
                  maxLength={MAX.speaker}
                  onChange={(event) => update("speaker", event.target.value)}
                  {...fieldProps("speaker")}
                />
                {showError("speaker")}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="eventDate" className="text-sm font-medium">
                  {t.certificates.field.eventDate}
                </label>
                <Input
                  id="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={(event) => update("eventDate", event.target.value)}
                  {...fieldProps("eventDate")}
                />
                {showError("eventDate")}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="position" className="text-sm font-medium">
                  {t.certificates.field.position}
                </label>
                <Input
                  id="position"
                  value={form.position}
                  maxLength={MAX.position}
                  onChange={(event) => update("position", event.target.value)}
                  {...fieldProps("position")}
                />
                {showError("position")}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="department" className="text-sm font-medium">
                  {t.certificates.field.department}
                </label>
                <Input
                  id="department"
                  value={form.department}
                  maxLength={MAX.department}
                  onChange={(event) => update("department", event.target.value)}
                  {...fieldProps("department")}
                />
                {showError("department")}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="internshipPeriod" className="text-sm font-medium">
                  {t.certificates.field.internshipPeriod}
                </label>
                <Input
                  id="internshipPeriod"
                  value={form.internshipPeriod}
                  maxLength={MAX.internshipPeriod}
                  onChange={(event) => update("internshipPeriod", event.target.value)}
                  {...fieldProps("internshipPeriod")}
                />
                {showError("internshipPeriod")}
              </div>
            </>
          )}
        </section>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/certificates">{t.common.cancel}</Link>
        </Button>
        <Button type="submit" disabled={!canSave}>
          {t.common.save}
        </Button>
      </div>
    </form>
  );
}
