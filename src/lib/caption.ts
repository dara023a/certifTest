import { Certificate, ORGANIZATION } from "./types";

/** Single source of truth for the publisher name shown in captions. */
const PUBLISHER = ORGANIZATION.name;

export function generateCaption(certificate: Certificate, verificationUrl: string) {
  if (certificate.type === "webinar") {
    return `Saya telah mengikuti Webinar "${certificate.eventTitle}" oleh ${PUBLISHER}.\n\nID Sertifikat: ${certificate.certificateId}\nTanggal Kegiatan: ${certificate.eventDate}\nTanggal Terbit: ${certificate.issuanceDate}\n\nVerifikasi sertifikat: ${verificationUrl}\n\n#LexaTech #Sertifikat #Webinar`;
  }

  return `Saya telah menyelesaikan Magang sebagai ${certificate.position} di ${certificate.department}, ${PUBLISHER}.\n\nID Sertifikat: ${certificate.certificateId}\nPeriode: ${certificate.internshipPeriod}\nTanggal Terbit: ${certificate.issuanceDate}\n\nVerifikasi sertifikat: ${verificationUrl}\n\n#LexaTech #Sertifikat #Magang`;
}
