"use client";

import { CertificateForm } from "@/components/admin/certificate-form";
import { CertificateFormSkeleton } from "@/components/admin/certificate-form-skeleton";
import { useAdminStore } from "@/lib/admin-store";

export function CertificateCreateView() {
  const { certificates, ready } = useAdminStore();

  if (!ready) {
    return <CertificateFormSkeleton />;
  }

  return <CertificateForm mode="create" certificates={certificates} />;
}
