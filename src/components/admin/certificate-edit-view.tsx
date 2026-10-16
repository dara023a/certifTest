"use client";

import { CertificateForm } from "@/components/admin/certificate-form";
import { CertificateFormSkeleton } from "@/components/admin/certificate-form-skeleton";
import { CertificateNotFound } from "@/components/admin/certificate-not-found";
import { useAdminStore } from "@/lib/admin-store";

export function CertificateEditView({ id }: { id: string }) {
  const { certificates, ready } = useAdminStore();

  if (!ready) {
    return <CertificateFormSkeleton />;
  }

  const certificate = certificates.find((item) => item.id === id);

  if (!certificate) {
    return <CertificateNotFound />;
  }

  return (
    <CertificateForm
      mode="edit"
      certificate={certificate}
      certificates={certificates}
      key={certificate.id}
    />
  );
}
