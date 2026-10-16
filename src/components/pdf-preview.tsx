"use client";

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

/**
 * Embeds the generated PDF in a landscape viewer.
 * Shows a skeleton while generating and a fallback when unavailable.
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
        ) : url ? (
          <iframe
            src={`${url}#toolbar=1&view=FitH`}
            title={title}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <FileWarning className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">{unavailableTitle}</p>
            <p className="max-w-md text-xs text-muted-foreground">{unavailableDesc}</p>
            <Button size="sm" variant="outline" onClick={onDownload} disabled={!url}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              {downloadLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
