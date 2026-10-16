import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";
import { SettingsProvider } from "@/contexts/settings-context";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
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
const themeInitScript = `(function(){try{var t=localStorage.getItem('cert-verify-theme');var d=t!=='light';document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

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
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col bg-background font-sans antialiased`}
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
