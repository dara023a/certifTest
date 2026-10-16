"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { TypeBadge } from "@/components/admin/status-badge";
import { useToast } from "@/components/admin/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/settings-context";
import { adminActions, newId, useAdminStore } from "@/lib/admin-store";
import { translations } from "@/lib/i18n";
import type { CertificateType, Template } from "@/lib/types";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 [@media(pointer:coarse)]:h-11";

interface TemplateForm {
  name: string;
  type: CertificateType;
  issuer: string;
  signerName: string;
  signerTitle: string;
  accentColor: string;
}

const emptyForm: TemplateForm = {
  name: "",
  type: "webinar",
  issuer: "Lexa Technologies",
  signerName: "",
  signerTitle: "",
  accentColor: "#2562f9",
};

export function TemplatesView() {
  const { language } = useSettings();
  const t = translations[language].admin;
  const { toast } = useToast();
  const { templates, certificates, ready } = useAdminStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [formError, setFormError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [inUseTarget, setInUseTarget] = useState<Template | null>(null);

  const usageById = useMemo(() => {
    const map = new Map<string, number>();
    for (const certificate of certificates) {
      if (!certificate.templateId) continue;
      map.set(certificate.templateId, (map.get(certificate.templateId) ?? 0) + 1);
    }
    return map;
  }, [certificates]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(false);
    setDialogOpen(true);
  };

  const openEdit = (template: Template) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      type: template.type,
      issuer: template.issuer,
      signerName: template.signerName,
      signerTitle: template.signerTitle,
      accentColor: template.accentColor,
    });
    setFormError(false);
    setDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.issuer.trim() || !form.signerName.trim()) {
      setFormError(true);
      return;
    }
    if (editingId) {
      adminActions.updateTemplate({
        id: editingId,
        name: form.name.trim(),
        type: form.type,
        issuer: form.issuer.trim(),
        signerName: form.signerName.trim(),
        signerTitle: form.signerTitle.trim(),
        accentColor: form.accentColor,
        createdAt:
          templates.find((template) => template.id === editingId)?.createdAt ??
          new Date().toISOString().slice(0, 10),
      });
    } else {
      adminActions.addTemplate({
        id: newId(),
        name: form.name.trim(),
        type: form.type,
        issuer: form.issuer.trim(),
        signerName: form.signerName.trim(),
        signerTitle: form.signerTitle.trim(),
        accentColor: form.accentColor,
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }
    toast(t.templates.saved, "success");
    setDialogOpen(false);
  };

  const requestDelete = (template: Template) => {
    if ((usageById.get(template.id) ?? 0) > 0) {
      setInUseTarget(template);
      return;
    }
    setDeleteTarget(template);
  };

  return (
    <>
      <AdminPageHeader
        title={t.templates.title}
        description={t.templates.subtitle}
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t.templates.add}
          </Button>
        }
      />

      <section className="overflow-x-auto rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">{t.templates.title}</caption>
          <thead>
            <tr className="border-b border-border text-left text-sm text-muted-foreground">
              <th scope="col" className="px-3 py-2 font-medium">{t.templates.colName}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t.templates.colType}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t.templates.colIssuer}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t.templates.colSigner}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t.templates.colAccent}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t.templates.colUsage}</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {!ready && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  {t.common.loading}
                </td>
              </tr>
            )}
            {ready && templates.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  {t.templates.empty}
                </td>
              </tr>
            )}
            {ready &&
              templates.map((template) => (
                <tr
                  key={template.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-3 font-medium">{template.name}</td>
                  <td className="px-3 py-3">
                    <TypeBadge
                      type={template.type}
                      labels={{ webinar: t.common.webinar, internship: t.common.internship }}
                    />
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{template.issuer}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {template.signerName}
                    {template.signerTitle ? ` · ${template.signerTitle}` : ""}
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: template.accentColor }}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-sm text-muted-foreground">
                        {template.accentColor}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {t.templates.usage(usageById.get(template.id) ?? 0)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t.common.edit}
                        onClick={() => openEdit(template)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        aria-label={t.common.delete}
                        onClick={() => requestDelete(template)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingId ? t.templates.editTitle : t.templates.createTitle}
              </DialogTitle>
              <DialogDescription>{t.templates.subtitle}</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="tpl-name" className="text-sm font-medium">
                  {t.templates.field.name}
                </label>
                <Input
                  id="tpl-name"
                  value={form.name}
                  onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
                  aria-invalid={formError && !form.name.trim() ? true : undefined}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tpl-type" className="text-sm font-medium">
                  {t.templates.field.type}
                </label>
                <select
                  id="tpl-type"
                  className={selectClass}
                  value={form.type}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, type: event.target.value as CertificateType }))
                  }
                >
                  <option value="webinar">{t.common.webinar}</option>
                  <option value="internship">{t.common.internship}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tpl-issuer" className="text-sm font-medium">
                  {t.templates.field.issuer}
                </label>
                <Input
                  id="tpl-issuer"
                  value={form.issuer}
                  onChange={(event) => setForm((f) => ({ ...f, issuer: event.target.value }))}
                  aria-invalid={formError && !form.issuer.trim() ? true : undefined}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="tpl-signer" className="text-sm font-medium">
                    {t.templates.field.signerName}
                  </label>
                  <Input
                    id="tpl-signer"
                    value={form.signerName}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, signerName: event.target.value }))
                    }
                    aria-invalid={formError && !form.signerName.trim() ? true : undefined}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tpl-signer-title" className="text-sm font-medium">
                    {t.templates.field.signerTitle}
                  </label>
                  <Input
                    id="tpl-signer-title"
                    value={form.signerTitle}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, signerTitle: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tpl-accent" className="text-sm font-medium">
                  {t.templates.field.accentColor}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="tpl-accent"
                    type="color"
                    value={form.accentColor}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, accentColor: event.target.value }))
                    }
                    className="h-8 w-12 cursor-pointer rounded-lg border border-input bg-transparent"
                  />
                  <span className="font-mono text-sm text-muted-foreground">
                    {form.accentColor}
                  </span>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive">{t.certificates.error.required}</p>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit">{t.common.save}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t.templates.deleteTitle}
        description={t.templates.deleteDesc}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            adminActions.deleteTemplate(deleteTarget.id);
            toast(t.templates.deleted, "success");
          }
        }}
      />

      <Dialog open={inUseTarget !== null} onOpenChange={(open) => !open && setInUseTarget(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t.templates.inUseTitle}</DialogTitle>
            <DialogDescription>{t.templates.inUseDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setInUseTarget(null)}>{t.common.cancel}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
