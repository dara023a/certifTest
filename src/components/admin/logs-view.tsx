"use client";

import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/settings-context";
import { adminActions, useAdminStore } from "@/lib/admin-store";
import { translations } from "@/lib/i18n";
import { formatDateTime, todayLocalISODate } from "@/lib/admin-format";
import { cn } from "@/lib/utils";
import type { VerificationLog, VerificationResult } from "@/lib/types";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 [@media(pointer:coarse)]:h-11";

/**
 * Guards a CSV cell against spreadsheet formula injection and quotes it.
 * Values starting with =, +, -, @ (or tab/CR) are prefixed with an apostrophe so
 * Excel/Sheets treat them as text rather than executing them as formulas.
 */
function csvCell(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${guarded.replace(/"/g, '""')}"`;
}

function resultLabel(
  result: VerificationResult,
  labels: { valid: string; revoked: string; notFound: string }
): string {
  if (result === "valid") return labels.valid;
  if (result === "revoked") return labels.revoked;
  return labels.notFound;
}

function ResultPill({
  result,
  labels,
}: {
  result: VerificationResult;
  labels: { valid: string; revoked: string; notFound: string };
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold",
        result === "valid" && "bg-emerald-700 text-white",
        result === "revoked" && "bg-red-600 text-white",
        result === "not_found" && "border border-border bg-muted text-muted-foreground"
      )}
    >
      {resultLabel(result, labels)}
    </span>
  );
}

export function LogsView() {
  const { language } = useSettings();
  const t = translations[language].admin;
  const { toast } = useToast();
  const { logs, ready } = useAdminStore();

  const [resultFilter, setResultFilter] = useState<"all" | VerificationResult>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [clearOpen, setClearOpen] = useState(false);

  const resultLabels = {
    valid: t.logs.resultValid,
    revoked: t.logs.resultRevoked,
    notFound: t.logs.resultNotFound,
  };
  const sourceLabels = {
    qr: t.logs.sourceQr,
    manual: t.logs.sourceManual,
    link: t.logs.sourceLink,
  };

  const filtered = useMemo(() => {
    const fromMs = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toMs = to ? new Date(`${to}T23:59:59`).getTime() : null;
    return logs.filter((log) => {
      if (resultFilter !== "all" && log.result !== resultFilter) return false;
      const time = new Date(log.timestamp).getTime();
      if (fromMs !== null && time < fromMs) return false;
      if (toMs !== null && time > toMs) return false;
      return true;
    });
  }, [logs, resultFilter, from, to]);

  const exportCsv = () => {
    const header = ["timestamp", "certificateId", "result", "source"];
    const rows = filtered.map((log: VerificationLog) => [
      log.timestamp,
      log.certificateId,
      log.result,
      log.source,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => csvCell(String(cell))).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lexa-verification-logs-${todayLocalISODate()}.csv`;
    // Safari needs the anchor in the DOM for programmatic downloads.
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    // Delay revocation so the download can start in all browsers.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <AdminPageHeader
        title={t.logs.title}
        description={t.logs.subtitle}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {t.logs.export}
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setClearOpen(true)}
              disabled={logs.length === 0}
            >
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {t.logs.clear}
            </Button>
          </div>
        }
      />

      <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label htmlFor="log-result" className="text-sm text-muted-foreground">
              {t.logs.filterResult}
            </label>
            <select
              id="log-result"
              className={selectClass}
              value={resultFilter}
              onChange={(event) =>
                setResultFilter(event.target.value as "all" | VerificationResult)
              }
            >
              <option value="all">{t.common.all}</option>
              <option value="valid">{t.logs.resultValid}</option>
              <option value="revoked">{t.logs.resultRevoked}</option>
              <option value="not_found">{t.logs.resultNotFound}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="log-from" className="text-sm text-muted-foreground">
              {t.logs.from}
            </label>
            <Input
              id="log-from"
              type="date"
              className="w-40"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="log-to" className="text-sm text-muted-foreground">
              {t.logs.to}
            </label>
            <Input
              id="log-to"
              type="date"
              className="w-40"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          {(resultFilter !== "all" || from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setResultFilter("all");
                setFrom("");
                setTo("");
              }}
            >
              {t.logs.resetFilter}
            </Button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg ring-1 ring-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">{t.logs.title}</caption>
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-sm text-muted-foreground">
                <th scope="col" className="px-3 py-2 font-medium">{t.logs.colTime}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t.logs.colId}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t.logs.colResult}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t.logs.colSource}</th>
              </tr>
            </thead>
            <tbody>
              {!ready && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    {t.common.loading}
                  </td>
                </tr>
              )}
              {ready && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-muted-foreground">
                    {t.logs.empty}
                  </td>
                </tr>
              )}
              {ready &&
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDateTime(log.timestamp, language)}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm">{log.certificateId}</td>
                    <td className="px-3 py-3">
                      <ResultPill result={log.result} labels={resultLabels} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {sourceLabels[log.source]}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          {t.logs.showing(filtered.length, logs.length)}
        </p>
      </section>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title={t.logs.clearTitle}
        description={t.logs.clearDesc(logs.length)}
        confirmLabel={t.logs.clear}
        cancelLabel={t.common.cancel}
        destructive
        onConfirm={() => {
          adminActions.clearLogs();
          toast(t.logs.cleared, "success");
        }}
      />
    </>
  );
}
