export const translations = {
  id: {
    language: "Bahasa",
    theme: "Mode",
    themeLight: "Terang",
    themeDark: "Gelap",
    homeTitle: "Verifikasi Sertifikat",
    homeSubtitle:
      "Periksa keabsahan sertifikat Webinar atau Magang Lexa Technologies dengan memasukkan ID sertifikat atau memindai kode QR.",
    enterId: "Masukkan ID Sertifikat",
    enterIdDesc: "Hanya ID sertifikat yang diperlukan. Data pribadi penerima tidak diminta.",
    enterIdError: "Masukkan ID sertifikat terlebih dahulu.",
    check: "Cek Sertifikat",
    exampleIds: "ID Contoh (Data Dummy)",
    qrDesc: "Anda juga dapat memverifikasi melalui URL atau kode QR yang tertera pada sertifikat.",
    notFoundTitle: "Sertifikat Tidak Ditemukan",
    notFoundDesc: (id: string) =>
      `ID sertifikat "${id}" tidak ditemukan dalam data contoh (dummy data). Periksa kembali ID yang dimasukkan.`,
    backHome: "Kembali ke Beranda",
    adminLink: "Dasbor Admin",

    // Certificate page
    back: "Kembali",
    previewPageTitle: "Preview Sertifikat",
    downloadPdf: "Unduh PDF",
    preparingPdf: "Menyiapkan PDF...",
    pdfNote:
      "Catatan: PDF ini merupakan sertifikat contoh/demonstrasi, bukan sertifikat resmi.",
    previewUnavailableTitle: "Pratinjau PDF tidak tersedia",
    previewUnavailableDesc:
      "Peramban Anda tidak dapat menampilkan pratinjau PDF secara langsung. Silakan unduh untuk melihat isinya.",
    previewHint: "Pratinjau tidak tampil? Unduh PDF.",

    // Verification status card
    verifiedBy: (issuer: string) => `Terverifikasi oleh ${issuer}`,
    valid: "Valid",
    revoked: "Dicabut / Dibatalkan",
    webinar: "Webinar",
    internship: "Magang",
    participantName: "Nama Peserta",
    certId: "Certificate ID",
    activityTitle: "Judul Kegiatan",
    activityDate: "Tanggal Kegiatan",
    issueDate: "Tanggal Diterbitkan",
    issuer: "Penerbit",
    speaker: "Pembicara",
    position: "Posisi",
    department: "Departemen",
    internshipPeriod: "Periode",
    revokedAlertTitle: "Sertifikat Dibatalkan",
    revokedAlertDesc:
      "Sertifikat ini telah dicabut atau dibatalkan oleh penerbit. Harap berhati-hati terhadap penggunaan atau pengakuan sertifikat ini.",

    // Permanent link
    permanentLinkLabel: "Link Verifikasi Permanen",
    copy: "Salin",
    copied: "Tersalin!",
    copyFailed: "Gagal menyalin. Salin secara manual.",

    // Share
    shareHeading: "Bagikan Sertifikat",
    shareIntro:
      "Tunjukkan pencapaianmu dan dapatkan pengakuan. Siapa pun dapat memverifikasi keaslian sertifikat ini melalui tautan di bawah.",
    shareLinkedIn: "LinkedIn",
    shareWhatsApp: "WhatsApp",
    shareX: "X",
    shareFacebook: "Facebook",
    shareTelegram: "Telegram",
    shareInstagram: "Instagram",
    shareDevice: "Bagikan lewat perangkat",
    copyCaption: "Salin Caption",
    captionLabel: "Caption",
    instagramNote:
      "Caption disalin. Unggah PDF/gambar secara manual di Instagram — situs ini tidak melakukan posting otomatis.",

    // Verified strip
    verifiedTitle: "Sertifikat Terverifikasi",
    verifiedDesc: (issuer: string) =>
      `Sertifikat ini diterbitkan dan diverifikasi oleh ${issuer}. Siapa pun dapat memverifikasi keaslian sertifikat ini melalui tautan di atas.`,
    claimDigital: "Diterbitkan secara digital",
    claimPublic: "Dapat diakses publik",
    claimStatus: "Status dapat berubah",

    // Footer
    footerTagline: "Prototype verifikasi sertifikat digital untuk keperluan demonstrasi.",
    footerRights: (year: number, name: string) =>
      `© ${year} ${name}. Semua hak dilindungi.`,
  },
  en: {
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    homeTitle: "Certificate Verification",
    homeSubtitle:
      "Verify the authenticity of Lexa Technologies Webinar or Internship certificates by entering the certificate ID or scanning the QR code.",
    enterId: "Enter Certificate ID",
    enterIdDesc: "Only the certificate ID is required. Recipient personal data is not requested.",
    enterIdError: "Please enter a certificate ID first.",
    check: "Verify Certificate",
    exampleIds: "Example IDs (Dummy Data)",
    qrDesc: "You can also verify via the URL or QR code printed on the certificate.",
    notFoundTitle: "Certificate Not Found",
    notFoundDesc: (id: string) =>
      `Certificate ID "${id}" was not found in sample (dummy) data. Please check the ID again.`,
    backHome: "Back to Home",
    adminLink: "Admin dashboard",

    // Certificate page
    back: "Back",
    previewPageTitle: "Certificate Preview",
    downloadPdf: "Download PDF",
    preparingPdf: "Preparing PDF...",
    pdfNote:
      "Note: This PDF is a sample/demonstration certificate, not an official certificate.",
    previewUnavailableTitle: "PDF preview unavailable",
    previewUnavailableDesc:
      "Your browser cannot display the PDF inline. Please download it to view the contents.",
    previewHint: "Preview not showing? Download the PDF.",

    // Verification status card
    verifiedBy: (issuer: string) => `Verified by ${issuer}`,
    valid: "Valid",
    revoked: "Revoked / Cancelled",
    webinar: "Webinar",
    internship: "Internship",
    participantName: "Participant Name",
    certId: "Certificate ID",
    activityTitle: "Event Title",
    activityDate: "Event Date",
    issueDate: "Issue Date",
    issuer: "Issuer",
    speaker: "Speaker",
    position: "Position",
    department: "Department",
    internshipPeriod: "Period",
    revokedAlertTitle: "Certificate Revoked",
    revokedAlertDesc:
      "This certificate has been revoked or cancelled by the issuer. Please be cautious about relying on it.",

    // Permanent link
    permanentLinkLabel: "Permanent Verification Link",
    copy: "Copy",
    copied: "Copied!",
    copyFailed: "Failed to copy. Please copy manually.",

    // Share
    shareHeading: "Share Certificate",
    shareIntro:
      "Show your achievement and get recognition. Anyone can verify this certificate through the link below.",
    shareLinkedIn: "LinkedIn",
    shareWhatsApp: "WhatsApp",
    shareX: "X",
    shareFacebook: "Facebook",
    shareTelegram: "Telegram",
    shareInstagram: "Instagram",
    shareDevice: "Share via device",
    copyCaption: "Copy Caption",
    captionLabel: "Caption",
    instagramNote:
      "Caption copied. Upload the PDF/image manually on Instagram — this site does not post automatically.",

    // Verified strip
    verifiedTitle: "Verified Certificate",
    verifiedDesc: (issuer: string) =>
      `This certificate is issued and verified by ${issuer}. Anyone can verify its authenticity through the link above.`,
    claimDigital: "Issued digitally",
    claimPublic: "Publicly accessible",
    claimStatus: "Status can change",

    // Footer
    footerTagline: "Digital certificate verification prototype for demonstration purposes.",
    footerRights: (year: number, name: string) =>
      `© ${year} ${name}. All rights reserved.`,
  },
} as const;
