import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";
import { SettingsProvider } from "@/contexts/settings-context";

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

/**
 * Applies the persisted theme before the first paint to avoid a flash of the
 * wrong theme. See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem('cert-verify-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-background font-sans antialiased`}
      >
        <SettingsProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Suspense fallback={<footer className="border-t border-border/60" />}>
            <SiteFooter />
          </Suspense>
        </SettingsProvider>
      </body>
    </html>
  );
}
