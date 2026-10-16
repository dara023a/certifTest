"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/page-header";
import { useToast } from "@/components/admin/toast";
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
import { translations } from "@/lib/i18n";
import type { Certificate, CertificateType } from "@/lib/types";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

type ErrorCode = "required" | "idFormat" | "idTaken" | null;

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

const idPattern = /^LEXA-(WBNR|INTR)-\d{4}-\d{3}$/i;

function createSchema(messages: { required: string; idFormat: string }) {
  return z
    .object({
      type: z.enum(["webinar", "internship"]),
      templateId: z.string().trim().min(1, messages.required),
      certificateId: z
        .string()
        .trim()
        .min(1, messages.required)
        .regex(idPattern, messages.idFormat),
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
      const require = (key: string, value: string | undefined) => {
        if (!value) {
          ctx.addIssue({ code: "custom", path: [key], message: messages.required });
        }
      };
      if (data.type === "webinar") {
        require("eventTitle", data.eventTitle);
        require("speaker", data.speaker);
        require("eventDate", data.eventDate);
      } else {
        require("position", data.position);
        require("department", data.department);
        require("internshipPeriod", data.internshipPeriod);
      }
    });
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
      issuanceDate: new Date().toISOString().slice(0, 10),
      eventTitle: "",
      speaker: "",
      eventDate: "",
      position: "",
      department: "",
      internshipPeriod: "",
    };
  });

  const [errors, setErrors] = useState<Record<string, ErrorCode>>({});

  const templateList = useMemo(
    () => templates.filter((template) => template.type === form.type),
    [templates, form.type]
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: null }));
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
    const requiredMessage = t.certificates.error.required;
    const idFormatMessage = t.certificates.error.idFormat;
    const schema = createSchema({
      required: requiredMessage,
      idFormat: idFormatMessage,
    });
    const result = schema.safeParse(form);

    if (!result.success) {
      const next: Record<string, ErrorCode> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (!key) continue;
        next[key] = issue.message === idFormatMessage ? "idFormat" : "required";
      }
      setErrors(next);
      return;
    }

    if (isCertificateIdTaken(form.certificateId, certificates, certificate?.id)) {
      setErrors({ certificateId: "idTaken" });
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

  const errorText = (code: ErrorCode) => {
    if (!code) return null;
    if (code === "idTaken") return t.certificates.error.idTaken;
    if (code === "idFormat") return t.certificates.error.idFormat;
    return t.certificates.error.required;
  };

  const showError = (key: string) => {
    const text = errorText(errors[key]);
    if (!text) return null;
    return (
      <p id={`${key}-error`} className="text-xs text-destructive">
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
          <div className="space-y-1.5">
            <label htmlFor="type" className="text-sm font-medium">
              {t.certificates.field.type}
            </label>
            <select
              id="type"
              className={selectClass}
              value={form.type}
              onChange={(event) => handleTypeChange(event.target.value as CertificateType)}
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
                className="font-mono"
                value={form.certificateId}
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
          </div>

          <div className="space-y-1.5">
            <label htmlFor="recipientName" className="text-sm font-medium">
              {t.certificates.field.recipientName}
            </label>
            <Input
              id="recipientName"
              value={form.recipientName}
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
            <p className="text-xs text-muted-foreground">{t.templates.todo}</p>
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
        <Button type="submit">{t.common.save}</Button>
      </div>
    </form>
  );
}
