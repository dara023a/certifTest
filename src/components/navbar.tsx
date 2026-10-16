"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LangToggle } from "./lang-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="sm" className="px-2 text-xs">
            <Link href="/">Beranda</Link>
          </Button>
          <Button asChild size="sm" className="px-2 text-xs">
            <Link href="/admin">Admin</Link>
          </Button>
          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}