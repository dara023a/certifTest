"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { generateCertificatePdf } from "@/lib/pdf";
import type { Certificate } from "@/lib/types";

interface UseCertificatePdfResult {
  /** Object URL for the generated PDF, or null while loading/on error. */
  blobUrl: string | null;
  /** True while the PDF is being generated. */
  loading: boolean;
  /** True if generation failed. */
  error: boolean;
  /** Triggers a download of the generated PDF. */
  download: () => void;
}

/**
 * Generates the demonstration certificate PDF once and exposes a blob URL
 * (for embedding) plus a download action. The blob URL is revoked on unmount.
 */
export function useCertificatePdf(
  certificate: Certificate,
  verificationUrl: string
): UseCertificatePdfResult {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const bytesRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!verificationUrl) return;
    let active = true;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const bytes = await generateCertificatePdf(certificate, verificationUrl);
        if (!active) return;

        const buffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength
        ) as ArrayBuffer;
        const blob = new Blob([buffer], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob);
        bytesRef.current = bytes;

        setBlobUrl(objectUrl);
        setLoading(false);
        setError(false);
      } catch (err) {
        console.error(err);
        if (!active) return;
        bytesRef.current = null;
        setBlobUrl(null);
        setLoading(false);
        setError(true);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [certificate, verificationUrl]);

  const download = useCallback(() => {
    const bytes = bytesRef.current;
    if (!bytes) return;

    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
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
  }, [certificate.certificateId]);

  return useMemo(
    () => ({ blobUrl, loading, error, download }),
    [blobUrl, loading, error, download]
  );
}
