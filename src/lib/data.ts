import { Certificate } from "./types";

export const certificates: Certificate[] = [
  {
    id: "cert-web-001",
    certificateId: "LEXA-WBNR-2026-001",
    type: "webinar",
    recipientName: "Andi Pratama",
    issuer: "Lexa Technologies",
    issuanceDate: "2026-10-11",
    status: "valid",
    eventTitle: "Introduction to Cybersecurity",
    speaker: "Dr. Budi Santoso",
    eventDate: "2026-10-10",
  },
  {
    id: "cert-int-001",
    certificateId: "LEXA-INTR-2026-001",
    type: "internship",
    recipientName: "Siti Rahmawati",
    issuer: "Lexa Technologies",
    issuanceDate: "2026-10-01",
    status: "valid",
    position: "Software Engineering Intern",
    department: "Technology",
    internshipPeriod: "1 July 2026 – 30 September 2026",
  },
  {
    id: "cert-web-002",
    certificateId: "LEXA-WBNR-2026-002",
    type: "webinar",
    recipientName: "Dummy Revoked Recipient",
    issuer: "Lexa Technologies",
    issuanceDate: "2026-10-12",
    status: "revoked",
    eventTitle: "Introduction to Cybersecurity",
    speaker: "Dr. Budi Santoso",
    eventDate: "2026-10-10",
  },
];

export function findCertificateById(certificateId: string): Certificate | undefined {
  return certificates.find(
    (cert) => cert.certificateId.toLowerCase() === certificateId.toLowerCase().trim()
  );
}

export function getAllCertificates(): Certificate[] {
  return certificates;
}