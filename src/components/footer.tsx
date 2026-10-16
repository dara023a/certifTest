"use client";

import Link from "next/link";
import { Mail, Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

import { Logo } from "@/components/logo";
import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";
import { ORGANIZATION } from "@/lib/types";

export function SiteFooter() {
  const { language } = useSettings();
  const t = translations[language];
  const year = new Date().getFullYear();

  const links = [
    { href: ORGANIZATION.social.instagram, label: "Instagram", Icon: Instagram },
    { href: ORGANIZATION.social.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: ORGANIZATION.social.facebook, label: "Facebook", Icon: Facebook },
    { href: ORGANIZATION.social.youtube, label: "YouTube", Icon: Youtube },
    { href: `mailto:${ORGANIZATION.email}`, label: "Email", Icon: Mail },
  ];

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-xs text-muted-foreground">{t.footerTagline}</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {links.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 transition hover:bg-accent hover:text-foreground"
                aria-label={label}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{t.footerRights(year, ORGANIZATION.name)}</span>
          <Link
            href={`mailto:${ORGANIZATION.email}`}
            className="transition hover:text-foreground"
          >
            {ORGANIZATION.email}
          </Link>
        </div>
      </div>
    </footer>
  );
}
