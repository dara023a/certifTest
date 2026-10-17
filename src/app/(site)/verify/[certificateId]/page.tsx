import { findCertificateById } from "@/lib/data";
import { CertificateVerifyView } from "@/components/certificate-verify-view";

interface VerifyPageProps {
  params: Promise<{ certificateId: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { certificateId } = await params;
  const certificate = findCertificateById(certificateId) ?? null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      {/*
       * The server resolves certificates from the static demo dataset only.
       * Admin-created certificates live in the browser (localStorage), so the
       * client component resolves them after hydration and logs the visit.
       */}
      <CertificateVerifyView
        certificateId={certificateId}
        initialCertificate={certificate}
      />
    </div>
  );
}

export async function generateStaticParams() {
  return [{ certificateId: "LEXA-WBNR-2026-001" }];
}
