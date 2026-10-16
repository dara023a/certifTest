"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Award,
  CheckCircle2,
  GraduationCap,
  Presentation,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { BarChart, type BarChartDatum } from "@/components/admin/bar-chart";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";
import { adminActions, useAdminStore } from "@/lib/admin-store";
import { translations } from "@/lib/i18n";
import { certificateHeadline, formatDateTime, formatWeekday } from "@/lib/admin-format";

export function DashboardView() {
  const { language } = useSettings();
  const t = translations[language].admin;
  const { toast } = useToast();
  const { certificates, logs, ready } = useAdminStore();
  const [resetOpen, setResetOpen] = useState(false);

  const total = certificates.length;
  const valid = certificates.filter((c) => c.status === "valid").length;
  const revoked = certificates.filter((c) => c.status === "revoked").length;
  const webinar = certificates.filter((c) => c.type === "webinar").length;
  const internship = certificates.filter((c) => c.type === "internship").length;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(startOfToday);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartMs = weekStart.getTime();

  const weekLogs = logs.filter((log) => new Date(log.timestamp).getTime() >= weekStartMs);

  const chartData: BarChartDatum[] = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    const dayStart = day.getTime();
    const dayEnd = dayStart + 86_400_000;
    const value = weekLogs.filter((log) => {
      const time = new Date(log.timestamp).getTime();
      return time >= dayStart && time < dayEnd;
    }).length;
    return { label: formatWeekday(day, language), value };
  });

  const latestCertificates = [...certificates]
    .sort((a, b) => b.issuanceDate.localeCompare(a.issuanceDate))
    .slice(0, 5);
  const latestLogs = logs.slice(0, 5);

  return (
    <>
      <AdminPageHeader
        title={t.dashboard.title}
        description={t.dashboard.subtitle}
        action={
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t.common.resetDemo}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t.dashboard.statTotal} value={total} icon={Award} loading={!ready} />
        <StatCard
          label={t.dashboard.statValid}
          value={valid}
          icon={CheckCircle2}
          tone="valid"
          loading={!ready}
        />
        <StatCard
          label={t.dashboard.statRevoked}
          value={revoked}
          icon={XCircle}
          tone="revoked"
          loading={!ready}
        />
        <StatCard
          label={t.dashboard.statWebinar}
          value={webinar}
          icon={Presentation}
          tone="webinar"
          loading={!ready}
        />
        <StatCard
          label={t.dashboard.statInternship}
          value={internship}
          icon={GraduationCap}
          tone="internship"
          loading={!ready}
        />
        <StatCard
          label={t.dashboard.statVerifications}
          value={weekLogs.length}
          icon={Activity}
          tone="activity"
          loading={!ready}
        />
      </div>

      <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <h2 className="text-base font-semibold tracking-tight">{t.dashboard.chartTitle}</h2>
        <div className="mt-4">
          <BarChart
            data={chartData}
            emptyLabel={t.dashboard.chartEmpty}
            ariaLabel={t.dashboard.chartTitle}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold tracking-tight">
              {t.dashboard.newestCertificates}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/certificates">{t.dashboard.viewAll}</Link>
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {latestCertificates.length === 0 && (
              <li className="py-4 text-sm text-muted-foreground">
                {t.dashboard.noCertificates}
              </li>
            )}
            {latestCertificates.map((certificate) => (
              <li key={certificate.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{certificate.recipientName}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {certificate.certificateId} · {certificateHeadline(certificate)}
                  </p>
                </div>
                <StatusBadge
                  status={certificate.status}
                  labels={{ valid: t.common.valid, revoked: t.common.revoked }}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold tracking-tight">
              {t.dashboard.newestVerifications}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/logs">{t.dashboard.viewAll}</Link>
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {latestLogs.length === 0 && (
              <li className="py-4 text-sm text-muted-foreground">{t.dashboard.noLogs}</li>
            )}
            {latestLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs">{log.certificateId}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(log.timestamp, language)}
                  </p>
                </div>
                <span className="text-xs font-semibold">
                  {log.result === "valid"
                    ? t.logs.resultValid
                    : log.result === "revoked"
                      ? t.logs.resultRevoked
                      : t.logs.resultNotFound}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={t.common.resetDemoTitle}
        description={t.common.resetDemoDesc}
        confirmLabel={t.common.resetDemo}
        cancelLabel={t.common.cancel}
        destructive
        onConfirm={() => {
          adminActions.resetDemoData();
          toast(t.common.resetDemo, "success");
        }}
      />
    </>
  );
}
