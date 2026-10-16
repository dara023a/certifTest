import { CertificateEditView } from "@/components/admin/certificate-edit-view";

interface EditCertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCertificatePage({
  params,
}: EditCertificatePageProps) {
  const { id } = await params;
  return <CertificateEditView id={id} />;
}
