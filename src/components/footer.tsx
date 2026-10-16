import { ORGANIZATION } from "@/lib/types";
import Link from "next/link";
import { Mail, Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

export function SiteFooter() {
  const name = ORGANIZATION.name;
  const links = [
    { href: ORGANIZATION.social.instagram, label: "Instagram", Icon: Instagram },
    { href: ORGANIZATION.social.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: ORGANIZATION.social.facebook, label: "Facebook", Icon: Facebook },
    { href: ORGANIZATION.social.youtube, label: "YouTube", Icon: Youtube },
  ];

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="space-y-2">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            Prototype verifikasi sertifikat digital untuk keperluan demonstrasi.
          </p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Media Sosial</p>
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
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Kontak</p>
            <Link
              href={`mailto:${ORGANIZATION.email}`}
              className="flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              {ORGANIZATION.email}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}