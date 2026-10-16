"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { Logo } from "./logo";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LangToggle } from "./lang-toggle";
import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";

export function Navbar() {
  const { language } = useSettings();
  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
          >
            <Link href="/admin" aria-label={t.adminLink} title={t.adminLink}>
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
