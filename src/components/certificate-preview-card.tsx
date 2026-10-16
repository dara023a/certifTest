"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Certificate } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Copy, Download, Link2, Share2, XCircle } from "lucide-react";
import { getVerificationUrl } from "@/lib/url";
import { generateCaption } from "@/lib/caption";
import { generateCertificatePdf } from "@/lib/pdf";
import QRCode from "qrcode";

interface CertificatePreviewCardProps {
  certificate: Certificate;
}

export function CertificatePreviewCard({ certificate }: CertificatePreviewCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const verificationUrl = getVerificationUrl(certificate.certificateId);
  const caption = generateCaption(certificate, verificationUrl);

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: "#020617",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [verificationUrl]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const pdfBytes = await generateCertificatePdf(certificate, verificationUrl);
      const buffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Sertifikat-${certificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Verifikasi Sertifikat",
          text: caption.split("\n")[0],
          url: verificationUrl,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
    verificationUrl
  )}&title=Verifikasi%20Sertifikat&summary=${encodeURIComponent(
    caption
  )}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${caption}\n${verificationUrl}`
  )}`;

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={certificate.status === "valid" ? "default" : "destructive"}
              className="uppercase"
            >
              {certificate.status === "valid" ? (
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              ) : (
                <XCircle className="mr-1 h-3.5 w-3.5" />
              )}
              {certificate.status === "valid" ? "Valid" : "Dicabut / Dibatalkan"}
            </Badge>
            <Badge variant="secondary">{certificate.type === "webinar" ? "Webinar" : "Magang"}</Badge>
          </div>
          <CardTitle className="text-2xl">Verifikasi Sertifikat</CardTitle>
          <CardDescription>
            ID Sertifikat: <span className="font-medium text-foreground">{certificate.certificateId}</span>
          </CardDescription>
        </div>
        <div className="flex flex-col items-center gap-2">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt={`QR Code untuk ${certificate.certificateId}`}
              width={160}
              height={160}
              className="h-40 w-40 rounded-lg border bg-white p-2"
              unoptimized
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-lg border bg-muted">
              <p className="text-xs text-muted-foreground">Memuat QR Code...</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Pindai untuk verifikasi</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {certificate.status === "revoked" ? (
          <Alert variant="destructive">
            <AlertTitle>Status Dibatalkan</AlertTitle>
            <AlertDescription>
              Sertifikat ini telah dicabut atau dibatalkan oleh penerbit. Harap berhati-hati
              terhadap penggunaan atau pengakuan sertifikat ini.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Penerima</p>
              <p className="text-lg font-medium">{certificate.recipientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Penerbit</p>
              <p className="font-medium">{certificate.issuer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Terbit</p>
              <p className="font-medium">{formatIdDate(certificate.issuanceDate)}</p>
            </div>
            {certificate.type === "webinar" ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Judul Webinar</p>
                  <p className="font-medium">{certificate.eventTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pembicara</p>
                  <p className="font-medium">{certificate.speaker}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Kegiatan</p>
                  <p className="font-medium">{formatIdDate(certificate.eventDate)}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Posisi Magang</p>
                  <p className="font-medium">{certificate.position}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departemen</p>
                  <p className="font-medium">{certificate.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Periode Magang</p>
                  <p className="font-medium">{certificate.internshipPeriod}</p>
                </div>
              </>
            )}
          </div>
          <div className="space-y-4">
            <Card className="bg-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pratinjau Sertifikat</CardTitle>
                <CardDescription>
                  Pratinjau visual untuk referensi. Unduh PDF untuk tampilan resmi (demonstrasi).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Nusantara Learning Institute
                  </p>
                  <p className="mt-2 text-lg font-semibold">{certificate.recipientName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {certificate.type === "webinar"
                      ? `Telah mengikuti: ${certificate.eventTitle}`
                      : `Telah menyelesaikan: ${certificate.position}`}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    ID: {certificate.certificateId} • Terbit: {formatIdDate(certificate.issuanceDate)}
                  </p>
                </div>
                <Button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? "Menyiapkan PDF..." : "Unduh Contoh PDF"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Catatan: PDF ini merupakan sertifikat contoh/demonstrasi, bukan sertifikat resmi.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold">Bagikan & Salin</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCopyUrl}>
              <Link2 className="mr-2 h-4 w-4" />
              {copiedUrl ? "Tersalin!" : "Salin URL Verifikasi"}
            </Button>
            <Button variant="outline" onClick={handleCopyCaption}>
              <Copy className="mr-2 h-4 w-4" />
              {copiedCaption ? "Tersalin!" : "Salin Caption"}
            </Button>
            <Button asChild variant="outline">
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                Bagikan ke LinkedIn
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Bagikan ke WhatsApp
              </a>
            </Button>
            {typeof navigator !== "undefined" && "share" in navigator ? (
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Bagikan (Web Share)
              </Button>
            ) : null}
          </div>
          <Alert>
            <AlertDescription>
              Untuk Instagram: salin caption dan unduh PDF, lalu unggah secara manual. Situs ini
              tidak melakukan posting otomatis ke Instagram.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}

function formatIdDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}