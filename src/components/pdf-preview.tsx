"use client";

import { useSyncExternalStore } from "react";
import { Download, FileWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PdfPreviewProps {
  url: string | null;
  loading: boolean;
  title: string;
  unavailableTitle: string;
  unavailableDesc: string;
  downloadLabel: string;
  onDownload: () => void;
  className?: string;
}

const emptySubscribe = () => () => {};

/**
 * Detects whether this browser can render an inline PDF.
 * iOS Safari (and Safari's inline viewer) cannot embed blob PDFs reliably, so
 * those users get the download fallback instead of a blank frame.
 */
function detectPdfEmbed(): boolean {
  if (typeof navigator === "undefined") {
    return true;
  }
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && typeof document !== "undefined" && "ontouchend" in document);
  if (isIOS) {
    return false;
  }
  const viewerEnabled = (navigator as Navigator & { pdfViewerEnabled?: boolean })
    .pdfViewerEnabled;
  if (typeof viewerEnabled === "boolean") {
    return viewerEnabled;
  }
  return true;
}

function PdfFallback({
  unavailableTitle,
  unavailableDesc,
  downloadLabel,
  onDownload,
  canDownload,
}: Omit<PdfPreviewProps, "url" | "loading" | "title" | "className"> & {
  canDownload: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <FileWarning className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{unavailableTitle}</p>
      <p className="max-w-md text-sm text-muted-foreground">{unavailableDesc}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={onDownload}
        disabled={!canDownload}
        className="mt-1"
      >
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        {downloadLabel}
      </Button>
    </div>
  );
}

/**
 * Embeds the generated PDF in a landscape viewer.
 * Shows a skeleton while generating, and a download fallback when the browser
 * cannot display inline PDFs (e.g. iOS Safari) or generation failed.
 */
export function PdfPreview({
  url,
  loading,
  title,
  unavailableTitle,
  unavailableDesc,
  downloadLabel,
  onDownload,
  className,
}: PdfPreviewProps) {
  const canEmbed = useSyncExternalStore(emptySubscribe, detectPdfEmbed, () => true);
  const showEmbed = Boolean(url) && canEmbed;
  const fallbackProps = {
    unavailableTitle,
    unavailableDesc,
    downloadLabel,
    onDownload,
    canDownload: Boolean(url),
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-muted/30",
        className
      )}
    >
      <div className="relative aspect-[297/210] w-full">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
        ) : showEmbed ? (
          <object
            data={`${url}#toolbar=1&view=FitH`}
            type="application/pdf"
            title={title}
            className="absolute inset-0 h-full w-full"
          >
            <PdfFallback {...fallbackProps} />
          </object>
        ) : (
          <PdfFallback {...fallbackProps} />
        )}
      </div>
    </div>
  );
}
