"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";

export function CertificateFormSkeleton() {
  const { language } = useSettings();
  const t = translations[language].admin;
  return (
    <>
      <AdminPageHeader title={t.certificates.title} description={t.certificates.subtitle} />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((column) => (
          <div
            key={column}
            className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6"
          >
            {Array.from({ length: 5 }).map((_, row) => (
              <div key={row} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
