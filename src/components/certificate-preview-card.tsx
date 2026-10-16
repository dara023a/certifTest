"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Copy, Download, ShieldCheck, XCircle } from "lucide-react";

import { Certificate } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PdfPreview } from "@/components/pdf-preview";
import { SharePanel } from "@/components/share-panel";
import { getVerificationUrl } from "@/lib/url";
import { generateCaption } from "@/lib/caption";
import { useCertificatePdf } from "@/hooks/use-certificate-pdf";
import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface CertificatePreviewCardProps {
  certificate: Certificate;
}

const emptySubscribe = () => () => {};

interface FieldProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function Field({ label, value, mono }: FieldProps) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("text-sm font-medium text-foreground", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

export function CertificatePreviewCard({ certificate }: CertificatePreviewCardProps) {
  const { language } = useSettings();
  const t = translations[language];
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Read the origin from the browser without breaking SSR/hydration.
  const origin = useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ""
  );
  const verificationUrl = origin ? getVerificationUrl(certificate.certificateId) : "";
  const caption = verificationUrl ? generateCaption(certificate, verificationUrl) : "";

  const { blobUrl, loading, download } = useCertificatePdf(certificate, verificationUrl);
  const isValid = certificate.status === "valid";

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2200);
    } catch (error) {
      console.error(error);
    }
  };

  const fields: FieldProps[] =
    certificate.type === "webinar"
      ? [
          { label: t.participantName, value: certificate.recipientName },
          { label: t.certId, value: certificate.certificateId, mono: true },
          { label: t.activityTitle, value: certificate.eventTitle },
          { label: t.speaker, value: certificate.speaker },
          { label: t.activityDate, value: certificate.eventDate },
          { label: t.issueDate, value: certificate.issuanceDate },
          { label: t.issuer, value: certificate.issuer },
        ]
      : [
          { label: t.participantName, value: certificate.recipientName },
          { label: t.certId, value: certificate.certificateId, mono: true },
          { label: t.activityTitle, value: certificate.position },
          { label: t.department, value: certificate.department },
          { label: t.internshipPeriod, value: certificate.internshipPeriod },
          { label: t.issueDate, value: certificate.issuanceDate },
          { label: t.issuer, value: certificate.issuer },
        ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t.back}
            </Link>
          </Button>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            {t.previewPageTitle}
          </h1>
        </div>
        <Button onClick={download} disabled={loading || !verificationUrl}>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          {loading ? t.preparingPdf : t.downloadPdf}
        </Button>
      </div>

      {/* PDF preview */}
      <PdfPreview
        url={blobUrl}
        loading={loading || !verificationUrl}
        title={t.previewPageTitle}
        unavailableTitle={t.previewUnavailableTitle}
        unavailableDesc={t.previewUnavailableDesc}
        downloadLabel={t.downloadPdf}
        onDownload={download}
      />
      <p className="text-xs text-muted-foreground">{t.pdfNote}</p>

      {/* Verification status */}
      <section className="rounded-xl border border-border bg-card p-6">
        <Badge
          className={cn(
            "gap-1.5 px-3 py-1 text-xs font-semibold",
            isValid
              ? "border-transparent bg-emerald-600 text-white hover:bg-emerald-600"
              : "border-transparent bg-destructive text-white hover:bg-destructive"
          )}
        >
          {isValid ? (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {t.verifiedBy(certificate.issuer)}
        </Badge>

        {!isValid && (
          <Alert variant="destructive" className="mt-4">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>{t.revokedAlertTitle}</AlertTitle>
            <AlertDescription>{t.revokedAlertDesc}</AlertDescription>
          </Alert>
        )}

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {fields.map((field) => (
            <Field key={field.label} label={field.label} value={field.value} mono={field.mono} />
          ))}
        </dl>

        {/* Permanent link */}
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{t.permanentLinkLabel}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={copyUrl}
              disabled={!verificationUrl}
            >
              {copiedUrl ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedUrl ? t.copied : t.copy}
            </Button>
          </div>
          <p className="mt-2 break-all font-mono text-xs text-foreground">
            {verificationUrl || "…"}
          </p>
        </div>
      </section>

      {/* Share */}
      <SharePanel caption={caption} verificationUrl={verificationUrl} onDownload={download} />

      {/* Verified strip */}
      <section className="flex gap-4 rounded-xl border border-border bg-card p-6">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isValid ? "bg-emerald-600/10 text-emerald-600" : "bg-destructive/10 text-destructive"
          )}
        >
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{t.verifiedTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.verifiedDesc(certificate.issuer)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[t.claimDigital, t.claimPublic, t.claimStatus].map((claim) => (
              <span
                key={claim}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
              >
                {claim}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
