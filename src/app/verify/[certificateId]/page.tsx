import { findCertificateById } from "@/lib/data";
import { CertificatePreviewCard } from "@/components/certificate-preview-card";
import { notFound } from "next/navigation";

interface VerifyPageProps {
  params: Promise<{ certificateId: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { certificateId } = await params;
  const certificate = findCertificateById(certificateId);

  if (!certificate) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <CertificatePreviewCard certificate={certificate} />
    </div>
  );
}

export async function generateStaticParams() {
  return [{ certificateId: "WEB-2026-001" }];
}