import { Certificate } from "./types";

export function generateCaption(certificate: Certificate, verificationUrl: string) {
  if (certificate.type === "webinar") {
    return `Saya telah mengikuti Webinar "${certificate.eventTitle}" oleh Nusantara Learning Institute.\n\nID Sertifikat: ${certificate.certificateId}\nTanggal Kegiatan: ${certificate.eventDate}\nTanggal Terbit: ${certificate.issuanceDate}\n\nVerifikasi sertifikat: ${verificationUrl}\n\n#NusantaraLearning #Sertifikat #Webinar`;
  }

  return `Saya telah menyelesaikan Magang sebagai ${certificate.position} di ${certificate.department}, Nusantara Learning Institute.\n\nID Sertifikat: ${certificate.certificateId}\nPeriode: ${certificate.internshipPeriod}\nTanggal Terbit: ${certificate.issuanceDate}\n\nVerifikasi sertifikat: ${verificationUrl}\n\n#NusantaraLearning #Sertifikat #Magang`;
}