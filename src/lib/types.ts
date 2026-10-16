export type CertificateType = "webinar" | "internship";

export interface WebinarCertificate {
  id: string;
  certificateId: string;
  type: "webinar";
  recipientName: string;
  recipientNameEn?: string;
  issuer: string;
  issuerEn?: string;
  issuanceDate: string;
  status: "valid" | "revoked";
  eventTitle: string;
  eventTitleEn?: string;
  speaker: string;
  speakerEn?: string;
  eventDate: string;
  templateId?: string;
}

export interface InternshipCertificate {
  id: string;
  certificateId: string;
  type: "internship";
  recipientName: string;
  recipientNameEn?: string;
  issuer: string;
  issuerEn?: string;
  issuanceDate: string;
  status: "valid" | "revoked";
  position: string;
  positionEn?: string;
  department: string;
  departmentEn?: string;
  internshipPeriod: string;
  internshipPeriodEn?: string;
  templateId?: string;
}

export type Certificate = WebinarCertificate | InternshipCertificate;

export interface Template {
  id: string;
  name: string;
  type: CertificateType;
  issuer: string;
  signerName: string;
  signerTitle: string;
  accentColor: string;
  createdAt: string;
}

export type VerificationResult = "valid" | "revoked" | "not_found";
export type VerificationSource = "qr" | "manual" | "link";

export interface VerificationLog {
  id: string;
  timestamp: string;
  certificateId: string;
  result: VerificationResult;
  source: VerificationSource;
}

export const ORGANIZATION = {
  name: "Lexa Technologies",
  nameId: "Lexa Technologies",
  nameEn: "Lexa Technologies",
  shortName: "Lexa Tech",
  website: "https://lexatech.id",
  email: "lexatech.official@gmail.com",
  social: {
    instagram: "https://instagram.com/lexatech.id",
    linkedin: "https://linkedin.com/company/lexa-tech",
    facebook: "https://facebook.com/lexatechid",
    youtube: "https://youtube.com/@lexatechid",
  },
} as const;

export type Language = "id" | "en";
export type Theme = "light" | "dark";