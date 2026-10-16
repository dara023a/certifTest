"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";

export default function Home() {
  const [certificateId, setCertificateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { language } = useSettings();
  const t = translations[language];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = certificateId.trim();
    if (!trimmed) {
      setError(t.enterIdError);
      return;
    }
    setError(null);
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="flex flex-col items-center text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-white">
          <QrCode className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.homeTitle}</h1>
        <p className="mt-4 max-w-2xl text-balance text-muted-foreground">{t.homeSubtitle}</p>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-base font-semibold tracking-tight">{t.enterId}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.enterIdDesc}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificateId">{t.certId}</Label>
            <Input
              id="certificateId"
              value={certificateId}
              onChange={(event) => setCertificateId(event.target.value)}
              placeholder="WEB-2026-001 / INT-2026-001"
              autoComplete="off"
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full">
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            {t.check}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{t.exampleIds}</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>WEB-2026-001 — {t.webinar}: Introduction to Cybersecurity</li>
            <li>INT-2026-001 — {t.internship}: Software Engineering Intern</li>
            <li>
              WEB-2026-002 — {t.webinar} ({t.revoked})
            </li>
          </ul>
          <p className="mt-3">{t.qrDesc}</p>
        </div>
      </section>
    </div>
  );
}
