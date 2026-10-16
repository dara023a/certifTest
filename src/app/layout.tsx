import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";
import { SettingsProvider } from "@/contexts/settings-context";
import { SettingsBar } from "@/components/settings-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verifikasi Sertifikat | Lexa Technologies",
  description:
    "Verifikasi sertifikat webinar dan magang secara publik melalui ID sertifikat.",
  keywords: ["verifikasi sertifikat", "sertifikat digital", "webinar", "magang"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-background font-sans antialiased`}
      >
        <SettingsProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </SettingsProvider>
      </body>
    </html>
  );
}