"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  RotateCcw,
  ShieldOff,
  Trash2,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge, TypeBadge } from "@/components/admin/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/settings-context";
import { adminActions, useAdminStore } from "@/lib/admin-store";
import { translations } from "@/lib/i18n";
import { certificateHeadline, formatDate } from "@/lib/admin-format";
import type { Certificate } from "@/lib/types";

const PAGE_SIZE = 10;

type TypeFilter = "all" | "webinar" | "internship";
type StatusFilter = "all" | "valid" | "revoked";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 [@media(pointer:coarse)]:h-11";

function RowActions({ certificate }: { certificate: Certificate }) {
  const { language } = useSettings();
  const t = translations[language].admin;
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<null | "revoke" | "restore" | "delete">(null);

  const isRevoked = certificate.status === "revoked";

  const runConfirm = () => {
    if (confirm === "delete") {
      adminActions.deleteCertificate(certificate.id);
      toast(t.certificates.deleted, "success");
    } else if (confirm === "revoke") {
      adminActions.setCertificateStatus(certificate.id, "revoked");
      toast(t.certificates.revoked, "success");
    } else if (confirm === "restore") {
      adminActions.setCertificateStatus(certificate.id, "valid");
      toast(t.certificates.restored, "success");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={`/verify/${certificate.certificateId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.common.view}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            />
          }
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{t.common.view}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={`/admin/certificates/${certificate.id}/edit`}
              aria-label={t.common.edit}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            />
          }
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{t.common.edit}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={isRevoked ? t.common.restore : t.common.revoke}
              onClick={() => setConfirm(isRevoked ? "restore" : "revoke")}
            />
          }
        >
          {isRevoked ? (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ShieldOff className="h-4 w-4" aria-hidden="true" />
          )}
        </TooltipTrigger>
        <TooltipContent>{isRevoked ? t.common.restore : t.common.revoke}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label={t.common.delete}
              onClick={() => setConfirm("delete")}
            />
          }
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{t.common.delete}</TooltipContent>
      </Tooltip>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={
          confirm === "delete"
            ? t.certificates.deleteTitle
            : confirm === "revoke"
              ? t.certificates.revokeTitle
              : t.certificates.restoreTitle
        }
        description={
          confirm === "delete"
            ? t.certificates.deleteDesc
            : confirm === "revoke"
              ? t.certificates.revokeDesc
              : t.certificates.restoreDesc
        }
        confirmLabel={
          confirm === "delete"
            ? t.common.delete
            : confirm === "revoke"
              ? t.common.revoke
              : t.common.restore
        }
        cancelLabel={t.common.cancel}
        destructive={confirm === "delete" || confirm === "revoke"}
        onConfirm={runConfirm}
      />
    </div>
  );
}

export function CertificatesView() {
  const { language } = useSettings();
  const t = translations[language].admin;
  const { certificates, ready } = useAdminStore();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return certificates.filter((certificate) => {
      if (typeFilter !== "all" && certificate.type !== typeFilter) return false;
      if (statusFilter !== "all" && certificate.status !== statusFilter) return false;
      if (!q) return true;
      return (
        certificate.certificateId.toLowerCase().includes(q) ||
        certificate.recipientName.toLowerCase().includes(q)
      );
    });
  }, [certificates, query, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      <AdminPageHeader
        title={t.certificates.title}
        description={t.certificates.subtitle}
        action={
          <Button asChild>
            <Link href="/admin/certificates/new">{t.certificates.add}</Link>
          </Button>
        }
      />

      <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="cert-search" className="sr-only">
              {t.common.search}
            </label>
            <Input
              id="cert-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={t.certificates.searchPlaceholder}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="cert-type" className="sr-only">
              {t.common.type}
            </label>
            <select
              id="cert-type"
              className={selectClass}
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as TypeFilter);
                setPage(1);
              }}
            >
              <option value="all">{t.common.all}</option>
              <option value="webinar">{t.common.webinar}</option>
              <option value="internship">{t.common.internship}</option>
            </select>
            <label htmlFor="cert-status" className="sr-only">
              {t.common.status}
            </label>
            <select
              id="cert-status"
              className={selectClass}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                setPage(1);
              }}
            >
              <option value="all">{t.common.all}</option>
              <option value="valid">{t.common.valid}</option>
              <option value="revoked">{t.common.revoked}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg ring-1 ring-border">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <caption className="sr-only">{t.certificates.title}</caption>
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-sm text-muted-foreground">
                <th scope="col" className="px-3 py-2 font-medium">{t.certificates.colId}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t.certificates.colName}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t.certificates.colType}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t.certificates.colTitle}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t.certificates.colIssued}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t.certificates.colStatus}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  {t.common.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {!ready &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-border/60">
                    {Array.from({ length: 7 }).map((__, cell) => (
                      <td key={cell} className="px-3 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))}

              {ready &&
                pageItems.map((certificate) => (
                  <tr
                    key={certificate.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-3 font-mono text-sm">{certificate.certificateId}</td>
                    <td className="px-3 py-3 font-medium">{certificate.recipientName}</td>
                    <td className="px-3 py-3">
                      <TypeBadge
                        type={certificate.type}
                        labels={{ webinar: t.common.webinar, internship: t.common.internship }}
                      />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {certificateHeadline(certificate)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(certificate.issuanceDate, language)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        status={certificate.status}
                        labels={{ valid: t.common.valid, revoked: t.common.revoked }}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <RowActions certificate={certificate} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {ready && pageItems.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium">{t.certificates.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.certificates.emptyDesc}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {t.common.page} {currentPage} {t.common.of} {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1}
            >
              {t.common.previous}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage >= totalPages}
            >
              {t.common.next}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
