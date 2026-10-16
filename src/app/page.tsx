"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Search } from "lucide-react";

export default function Home() {
  const [certificateId, setCertificateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = certificateId.trim();
    if (!trimmed) {
      setError("Masukkan ID sertifikat terlebih dahulu.");
      return;
    }
    setError(null);
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex flex-col items-center text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-green-500 text-white">
          <QrCode className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          Verifikasi Sertifikat
        </h1>
        <p className="mt-4 max-w-2xl text-balance text-muted-foreground">
          Periksa keabsahan sertifikat Webinar atau Magang Nusantara Learning Institute
          dengan memasukkan ID sertifikat atau memindai kode QR.
        </p>
      </section>

      <section className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Masukkan ID Sertifikat</CardTitle>
            <CardDescription>
              Hanya ID sertifikat yang diperlukan. Data pribadi penerima tidak diminta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificateId">ID Sertifikat</Label>
                <Input
                  id="certificateId"
                  value={certificateId}
                  onChange={(event) => setCertificateId(event.target.value)}
                  placeholder="Contoh: WEB-2026-001 atau INT-2026-001"
                  autoComplete="off"
                />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Cek Sertifikat
              </Button>
            </form>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">ID Contoh (Data Dummy)</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>WEB-2026-001 — Webinar: Introduction to Cybersecurity</li>
                <li>INT-2026-001 — Magang: Software Engineering Intern</li>
                <li>WEB-2026-002 — Webinar (Status: Dicabut/Dibatalkan)</li>
              </ul>
              <p className="mt-3">
                Anda juga dapat memverifikasi melalui URL atau kode QR yang tertera pada sertifikat.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}