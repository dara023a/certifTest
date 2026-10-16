# Verifikasi Sertifikat Digital - Lexa Technologies (Prototype)

Aplikasi prototipe untuk verifikasi sertifikat digital jenis **Webinar** dan **Internship** berbasis Next.js. Didesain dengan antarmuka profesional, responsif, multi-bahasa (Indonesia/Inggris), dukungan mode terang-gelap, serta fitur berbagi & unduh PDF.

> **Catatan:** Ini adalah **prototype demonstrasi**. Autentikasi, penyimpanan data, dan proteksi bersifat simulasi. Tidak boleh digunakan untuk lingkungan produksi tanpa pengembangan backend yang aman.

## 1. Fitur Utama

- **Verifikasi Publik** – Cek keabsahan sertifikat berdasarkan ID sertifikat atau scan QR Code.
- **Dua Jenis Sertifikat** – Mendukung sertifikat Webinar dan Magang (Internship) dengan field relevan.
- **Status Sertifikat** – Menampilkan status `Valid` atau `Dicabut/Dibatalkan` (Revoked).
- **Halaman Detail** – Menampilkan data penerima, penerbit, tanggal terbit, info kegiatan/magang, serta pratinjau sertifikat.
- **QR Code** – QR Code unik mengarah ke URL verifikasi canonical untuk setiap sertifikat.
- **Unduh PDF Contoh** – Generate sample PDF berformat landscape menggunakan `pdf-lib` (bersifat demonstrasi).
- **Salin & Bagikan** – Salin URL verifikasi, salin caption dinamis, share ke LinkedIn/WhatsApp, serta Web Share API (jika tersedia). Untuk Instagram: salin caption & unduh PDF (tidak ada auto-post).
- **Multi-Bahasa** – Dukungan Bahasa Indonesia & Inggris (toggle di navbar).
- **Mode Terang/Gelap** – Toggle tema light/dark di navbar (disimpan di `localStorage`).
- **Dashboard Admin (Simulasi)** – Daftar sertifikat, pencarian/filter, form UI "Buat Sertifikat" (dinonaktifkan) dengan peringatan simulasi.
- **Desain Responsif** – Optimal untuk mobile, tablet, dan desktop.
- **Siap Migrasi ke Supabase** – Lapisan data terpisah (`src/lib/data.ts`) sehingga mudah diganti dengan Supabase PostgreSQL + Auth + RLS.

## 2. Teknologi

- [Next.js 16](https://nextjs.org/) – App Router, TypeScript
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) – Komponen UI
- [lucide-react](https://lucide.dev/) – Ikon
- [qrcode](https://github.com/soldair/node-qrcode) – Generate QR Code
- [pdf-lib](https://pdf-lib.js.org/) – Generate PDF
- [Zod](https://zod.dev/) – Validasi (siap digunakan)

## 3. Struktur Proyek

```text
src/
├── app/
│   ├── admin/                # Dashboard admin (simulasi)
│   ├── layout.tsx            # Root layout + SettingsProvider
│   ├── page.tsx              # Homepage (form verifikasi)
│   └── verify/[certificateId]/ # Halaman verifikasi sertifikat
├── components/
│   ├── ui/                   # Komponen shadcn/ui
│   ├── certificate-preview-card.tsx
│   ├── footer.tsx
│   ├── lang-toggle.tsx
│   ├── logo.tsx
│   ├── navbar.tsx
│   ├── settings-bar.tsx
│   └── theme-toggle.tsx
├── contexts/
│   └── settings-context.tsx  # Context bahasa & tema
└── lib/
    ├── caption.ts            # Generate caption dinamis
    ├── data.ts               # Dummy data & query
    ├── i18n.ts               # Terjemahan ID/EN
    ├── pdf.ts                # Generate sample PDF
    ├── types.ts              # Tipe data & ORGANIZATION
    └── url.ts                # Base URL & verification URL
```

## 4. Data Dummy (Contoh)

Tersedia 3 record demonstrasi:

| ID Sertifikat | Tipe    | Penerima                | Status   | Keterangan                        |
|---------------|---------|-------------------------|----------|-----------------------------------|
| `WEB-2026-001` | Webinar | Andi Pratama           | Valid    | Introduction to Cybersecurity     |
| `INT-2026-001` | Magang  | Siti Rahmawati         | Valid    | Software Engineering Intern       |
| `WEB-2026-002` | Webinar | Dummy Revoked Recipient| Revoked  | Introduction to Cybersecurity     |

## 5. Branding & Konfigurasi

Konfigurasi organisasi berada di [`src/lib/types.ts`](src/lib/types.ts):

```ts
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
```

- Logo placeholder tersedia di [`public/logo.svg`](public/logo.svg)
- Nama perusahaan, sosial media & email dapat diganti langsung di file ini

## 6. Instalasi & Menjalankan

### Prasyarat
- Node.js >= 18.18 (rekomendasi 20+)
- npm (atau pnpm/yarn/bun)

### Langkah-langkah

1. **Clone/akses proyek**
   ```bash
   cd D:\verify-Certificate
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Jalankan development server**
   ```bash
   npm run dev
   ```
   Akses aplikasi di: [http://localhost:3000](http://localhost:3000)

4. **Build untuk production**
   ```bash
   npm run build
   ```

5. **Jalankan production build (lokal)**
   ```bash
   npm start
   ```

6. **Linting**
   ```bash
   npm run lint
   ```

7. **Type-check**
   ```bash
   npx tsc --noEmit
   ```

## 7. Pengujian Manual (Acceptance Check)

| No | Skenario | Hasil yang Diharapkan |
|---|----------|------------------------|
| 1 | Homepage `/` | Berhasil dimuat, form verifikasi & contoh ID tampil |
| 2 | Valid ID `WEB-2026-001` | Halaman `/verify/WEB-2026-001` menampilkan data webinar + status Valid |
| 3 | Valid ID `INT-2026-001` | Menampilkan data magang + status Valid |
| 4 | Revoked ID `WEB-2026-002` | Menampilkan banner "Dicabut/Dibatalkan" |
| 5 | Unknown ID `XXX-000` | Halaman "Sertifikat Tidak Ditemukan" (not-found) |
| 6 | QR Code | Mengarah ke URL verifikasi yang benar (canonical) |
| 7 | Unduh PDF | File `Sertifikat-[ID].pdf` terunduh |
| 8 | Copy URL | URL verifikasi tersalin |
| 9 | Copy Caption | Caption dinamis (sesuai tipe) tersalin |
| 10 | Share LinkedIn/WA | Link share ter-generate dengan benar |
| 11 | Web Share API | Tersedia di browser yang mendukung |
| 12 | Responsive | Layout rapi di mobile/tablet/desktop |
| 13 | Toggle Bahasa | Berpindah ID<->EN, teks ter-update |
| 14 | Toggle Tema | Berpindah light<->dark, preferensi tersimpan |
| 15 | Admin `/admin` | Tabel daftar, filter, peringatan simulasi tampil |

## 8. Keterangan Teknis

- **Canonical URL** – Dibangun via `getVerificationUrl()` di [`src/lib/url.ts`](src/lib/url.ts). Menggunakan `window.location.origin` di client atau `NEXT_PUBLIC_BASE_URL`/`VERCEL_URL` di server.
- **PDF Generation** – Berjalan di browser (client-side) untuk kemudahan prototipe. QR Code di-embed sebagai PNG data URL.
- **State Settings** – Menggunakan React Context + `localStorage` dengan `mounted` guard untuk menghindari hydration mismatch.
- **Not Found Handling** – Menggunakan `notFound()` dari Next.js untuk unknown certificate ID.
- **Static Params** – `generateStaticParams` mengembalikan minimal 1 item untuk menghindari error build dengan Cache Components.
- **Supabase Ready** – Struktur data terpisah. Untuk integrasi: ganti `findCertificateById`/`getAllCertificates` di `src/lib/data.ts` dengan call ke Supabase (gunakan server actions/API route + RLS + Auth).

## 9. Batasan Prototype

- **Tidak aman untuk produksi** – Tidak ada autentikasi server-side, tidak ada RBAC, tidak ada validasi berlapis, data hanya di-memory/dummy.
- **Client-side PDF** – Cocok untuk demo; untuk produksi bisa dipindah ke API route.
- **localStorage untuk settings** – Bukan sumber truth auth; hanya untuk preferensi UI.
- **Instagram** – Tidak mendukung posting otomatis.
- **Hardcoded dummy** – Hanya untuk demonstrasi.

## 10. Lisensi

Prototipe ini dibuat untuk keperluan demonstrasi internal Lexa Technologies. Dapat dimodifikasi sesuai kebutuhan.

## 11. Kontak

- Email: [lexatech.official@gmail.com](mailto:lexatech.official@gmail.com)
- Website: [lexatech.id](https://lexatech.id)
- Instagram: [@lexatech.id](https://instagram.com/lexatech.id)
- Facebook: [@lexatechid](https://facebook.com/lexatechid)
- YouTube: [@lexatechid](https://youtube.com/@lexatechid)
- LinkedIn: [Lexa Tech](https://linkedin.com/company/lexa-tech)
