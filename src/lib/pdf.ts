import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import type { PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import { Certificate, ORGANIZATION } from "./types";
import { sanitizeWinAnsi } from "./text";

/** Single source of truth for the publisher name printed on the PDF. */
const PUBLISHER = ORGANIZATION.name;

/** Left edge of the body text. */
const TEXT_LEFT = 60;
/** Right edge of the body text — kept clear of the QR column (x >= 650). */
const TEXT_RIGHT = 600;
const TEXT_WIDTH = TEXT_RIGHT - TEXT_LEFT;
/** Full content width, safe for content above the QR block. */
const WIDE_WIDTH = 720;

/**
 * Greedy word wrap using the real font metrics. Words wider than the line are
 * hard-broken so text can never overflow the page.
 */
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  const flush = () => {
    if (current) lines.push(current);
    current = "";
  };

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    flush();
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
      continue;
    }
    let chunk = "";
    for (const char of word) {
      if (font.widthOfTextAtSize(chunk + char, size) > maxWidth) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk += char;
      }
    }
    current = chunk;
  }
  flush();

  return lines.length ? lines : [""];
}

/** Limits a wrapped block and ellipsizes the final line. */
function clampLines(lines: string[], max: number): string[] {
  if (lines.length <= max) {
    return lines;
  }
  const kept = lines.slice(0, max);
  const last = kept[max - 1];
  kept[max - 1] = `${last.slice(0, Math.max(0, last.length - 1))}…`;
  return kept;
}

/** Shrinks a single-line label until it fits, down to `minSize`. */
function fitFontSize(
  text: string,
  font: PDFFont,
  size: number,
  minSize: number,
  maxWidth: number
): number {
  let current = size;
  while (current > minSize && font.widthOfTextAtSize(text, current) > maxWidth) {
    current -= 1;
  }
  return current;
}

export async function generateCertificatePdf(
  certificate: Certificate,
  verificationUrl: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const safe = (value: string) => sanitizeWinAnsi(value).trim();

  // Tag QR visits so the admin verification log can distinguish the source.
  const separator = verificationUrl.includes("?") ? "&" : "?";
  const qrUrl = `${verificationUrl}${separator}src=qr`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
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
    borderColor: rgb(13 / 255, 19 / 255, 69 / 255),
    borderWidth: 2,
  });

  page.drawText(PUBLISHER.toUpperCase(), {
    x: TEXT_LEFT,
    y: 520,
    size: 18,
    font,
    color: rgb(37 / 255, 98 / 255, 249 / 255),
  });

  page.drawText("SERTIFIKAT DIGITAL (DEMONSTRASI)", {
    x: TEXT_LEFT,
    y: 496,
    size: 12,
    font: fontRegular,
    color: rgb(71 / 255, 85 / 255, 105 / 255),
  });

  page.drawText("DIBERIKAN KEPADA", {
    x: TEXT_LEFT,
    y: 440,
    size: 12,
    font: fontRegular,
    color: rgb(51 / 255, 65 / 255, 85 / 255),
  });

  // --- Recipient name (shrink to fit; wrap at most twice). ---
  const nameText = safe(certificate.recipientName).toUpperCase();
  const nameSize = fitFontSize(nameText, font, 28, 16, WIDE_WIDTH);
  const nameLines =
    font.widthOfTextAtSize(nameText, nameSize) <= WIDE_WIDTH
      ? [nameText]
      : clampLines(wrapText(nameText, font, nameSize, WIDE_WIDTH), 2);

  let cursor = 404;
  for (const line of nameLines) {
    page.drawText(line, {
      x: TEXT_LEFT,
      y: cursor,
      size: nameSize,
      font,
      color: rgb(15 / 255, 23 / 255, 42 / 255),
    });
    cursor -= nameSize + 6;
  }
  cursor -= 12;

  // --- Activity description. ---
  const description =
    certificate.type === "webinar"
      ? `Telah mengikuti Webinar: ${safe(certificate.eventTitle)}`
      : `Telah menyelesaikan Magang sebagai ${safe(certificate.position)}`;
  const descriptionLines = clampLines(
    wrapText(description, fontRegular, 14, TEXT_WIDTH),
    3
  );
  for (const line of descriptionLines) {
    page.drawText(line, {
      x: TEXT_LEFT,
      y: cursor,
      size: 14,
      font: fontRegular,
      color: rgb(30 / 255, 41 / 255, 59 / 255),
    });
    cursor -= 20;
  }
  cursor -= 4;

  // --- Type-specific details. ---
  const details =
    certificate.type === "webinar"
      ? [
          `Pembicara: ${safe(certificate.speaker)}`,
          `Tanggal Kegiatan: ${safe(formatDate(certificate.eventDate))}`,
        ]
      : [
          `Departemen: ${safe(certificate.department)}`,
          `Periode Magang: ${safe(certificate.internshipPeriod)}`,
        ];
  for (const detail of details) {
    const lines = clampLines(wrapText(detail, fontRegular, 12, TEXT_WIDTH), 2);
    for (const line of lines) {
      page.drawText(line, {
        x: TEXT_LEFT,
        y: cursor,
        size: 12,
        font: fontRegular,
        color: rgb(51 / 255, 65 / 255, 85 / 255),
      });
      cursor -= 17;
    }
  }
  cursor -= 4;

  page.drawText(safe(`Diterbitkan pada: ${formatDate(certificate.issuanceDate)}`), {
    x: TEXT_LEFT,
    y: cursor,
    size: 12,
    font: fontRegular,
    color: rgb(51 / 255, 65 / 255, 85 / 255),
  });
  cursor -= 17;

  page.drawText(safe(`ID Sertifikat: ${certificate.certificateId}`), {
    x: TEXT_LEFT,
    y: cursor,
    size: 12,
    font: fontRegular,
    color: rgb(51 / 255, 65 / 255, 85 / 255),
  });

  // --- Revoked stamp. ---
  if (certificate.status === "revoked") {
    const stamp = "DICABUT";
    const stampSize = 150;
    const stampWidth = font.widthOfTextAtSize(stamp, stampSize);
    page.drawText(stamp, {
      x: (842 - stampWidth) / 2,
      y: 210,
      size: stampSize,
      font,
      color: rgb(220 / 255, 38 / 255, 38 / 255),
      opacity: 0.18,
      rotate: degrees(20),
    });
    page.drawText("STATUS: DICABUT / REVOKED", {
      x: TEXT_LEFT,
      y: cursor - 22,
      size: 12,
      font,
      color: rgb(220 / 255, 38 / 255, 38 / 255),
    });
  }

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
    x: TEXT_LEFT,
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
