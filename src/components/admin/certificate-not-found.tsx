"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";

export function CertificateNotFound() {
  const { language } = useSettings();
  const t = translations[language].admin;

  return (
    <div className="grid place-items-center rounded-xl bg-card py-16 text-center ring-1 ring-foreground/10">
      <FileQuestion className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium">{t.certificates.emptyTitle}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t.certificates.emptyDesc}</p>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/admin/certificates">{t.certificates.title}</Link>
      </Button>
    </div>
  );
}
