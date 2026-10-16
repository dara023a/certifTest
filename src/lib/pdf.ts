import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { Certificate } from "./types";

export async function generateCertificatePdf(
  certificate: Certificate,
  verificationUrl: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 128,
    margin: 1,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
  const qrImage = await pdfDoc.embedPng(qrDataUrl);

  page.drawRectangle({
    x: 24,
    y: 24,
    width: 794,
    height: 547,
    borderColor: rgb(15 / 255, 23 / 255, 42 / 255),
    borderWidth: 2,
  });

  page.drawText("NUSANTARA LEARNING INSTITUTE", {
    x: 60,
    y: 520,
    size: 18,
    font,
    color: rgb(30 / 255, 64 / 255, 175 / 255),
  });

  page.drawText("SERTIFIKAT DIGITAL (DEMONSTRASI)", {
    x: 60,
    y: 496,
    size: 12,
    font: fontRegular,
    color: rgb(71 / 255, 85 / 255, 105 / 255),
  });

  page.drawText("DIBERIKAN KEPADA", {
    x: 60,
    y: 440,
    size: 12,
    font: fontRegular,
    color: rgb(51 / 255, 65 / 255, 85 / 255),
  });

  page.drawText(certificate.recipientName.toUpperCase(), {
    x: 60,
    y: 410,
    size: 28,
    font,
    color: rgb(15 / 255, 23 / 255, 42 / 255),
  });

  if (certificate.type === "webinar") {
    page.drawText(`Telah mengikuti Webinar: ${certificate.eventTitle}`, {
      x: 60,
      y: 370,
      size: 14,
      font: fontRegular,
      color: rgb(30 / 255, 41 / 255, 59 / 255),
    });
    page.drawText(`Pembicara: ${certificate.speaker}`, {
      x: 60,
      y: 348,
      size: 12,
      font: fontRegular,
      color: rgb(51 / 255, 65 / 255, 85 / 255),
    });
    page.drawText(`Tanggal Kegiatan: ${formatDate(certificate.eventDate)}`, {
      x: 60,
      y: 328,
      size: 12,
      font: fontRegular,
      color: rgb(51 / 255, 65 / 255, 85 / 255),
    });
  } else {
    page.drawText(`Telah menyelesaikan Magang sebagai ${certificate.position}`, {
      x: 60,
      y: 370,
      size: 14,
      font: fontRegular,
      color: rgb(30 / 255, 41 / 255, 59 / 255),
    });
    page.drawText(`Departemen: ${certificate.department}`, {
      x: 60,
      y: 348,
      size: 12,
      font: fontRegular,
      color: rgb(51 / 255, 65 / 255, 85 / 255),
    });
    page.drawText(`Periode Magang: ${certificate.internshipPeriod}`, {
      x: 60,
      y: 328,
      size: 12,
      font: fontRegular,
      color: rgb(51 / 255, 65 / 255, 85 / 255),
    });
  }

  page.drawText(`Diterbitkan pada: ${formatDate(certificate.issuanceDate)}`, {
    x: 60,
    y: 290,
    size: 12,
    font: fontRegular,
    color: rgb(51 / 255, 65 / 255, 85 / 255),
  });

  page.drawText(`ID Sertifikat: ${certificate.certificateId}`, {
    x: 60,
    y: 268,
    size: 12,
    font: fontRegular,
    color: rgb(51 / 255, 65 / 255, 85 / 255),
  });

  page.drawImage(qrImage, {
    x: 650,
    y: 80,
    width: 120,
    height: 120,
  });

  page.drawText("Pindai QR untuk verifikasi", {
    x: 650,
    y: 64,
    size: 10,
    font: fontRegular,
    color: rgb(71 / 255, 85 / 255, 105 / 255),
  });

  page.drawText("CATATAN: Ini adalah sertifikat demonstrasi / contoh.", {
    x: 60,
    y: 60,
    size: 9,
    font: fontRegular,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}