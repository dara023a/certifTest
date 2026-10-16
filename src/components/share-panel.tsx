"use client";

import { useState } from "react";
import { Check, Copy, Linkedin, Facebook, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";
import { WhatsAppIcon, XIcon, TelegramIcon, InstagramIcon } from "@/components/icons";

interface SharePanelProps {
  caption: string;
  verificationUrl: string;
  onDownload: () => void;
}

export function SharePanel({ caption, verificationUrl, onDownload }: SharePanelProps) {
  const { language } = useSettings();
  const t = translations[language];
  const [feedback, setFeedback] = useState<string | null>(null);

  const notify = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2200);
  };

  const copyText = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(successMessage);
    } catch (error) {
      console.error(error);
      notify(t.copyFailed);
    }
  };

  const captionWithUrl = verificationUrl ? `${caption}\n${verificationUrl}` : caption;

  const intents = [
    {
      key: "linkedin",
      label: t.shareLinkedIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        verificationUrl
      )}`,
      Icon: Linkedin,
    },
    {
      key: "whatsapp",
      label: t.shareWhatsApp,
      href: `https://wa.me/?text=${encodeURIComponent(captionWithUrl)}`,
      Icon: WhatsAppIcon,
    },
    {
      key: "x",
      label: t.shareX,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        caption
      )}&url=${encodeURIComponent(verificationUrl)}`,
      Icon: XIcon,
    },
    {
      key: "facebook",
      label: t.shareFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        verificationUrl
      )}`,
      Icon: Facebook,
    },
    {
      key: "telegram",
      label: t.shareTelegram,
      href: `https://t.me/share/url?url=${encodeURIComponent(
        verificationUrl
      )}&text=${encodeURIComponent(caption)}`,
      Icon: TelegramIcon,
    },
  ];

  const handleInstagram = async () => {
    // Instagram has no web share intent: copy caption + trigger PDF download.
    try {
      await navigator.clipboard.writeText(caption);
    } catch (error) {
      console.error(error);
    }
    onDownload();
    notify(t.instagramNote);
  };

  const handleDeviceShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: t.previewPageTitle,
          text: caption,
          url: verificationUrl,
        });
      } catch (error) {
        // User cancelled the share sheet — not an error worth surfacing.
        if ((error as DOMException)?.name !== "AbortError") {
          console.error(error);
        }
      }
    } else {
      await copyText(verificationUrl, t.copied);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold tracking-tight">{t.shareHeading}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.shareIntro}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {intents.map(({ key, label, href, Icon }) => (
          <Button key={key} asChild variant="outline" size="sm" className="gap-2">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </a>
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleInstagram}
        >
          <InstagramIcon className="h-4 w-4" aria-hidden="true" />
          {t.shareInstagram}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleDeviceShare}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {t.shareDevice}
        </Button>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {t.captionLabel}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => copyText(caption, t.copied)}
          >
            {feedback === t.copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {t.copyCaption}
          </Button>
        </div>
        <textarea
          readOnly
          value={caption}
          rows={7}
          aria-label={t.captionLabel}
          className="w-full resize-none rounded-lg border border-border bg-muted/30 p-3 font-mono text-base leading-relaxed text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
        />
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-sm text-muted-foreground"
      >
        {feedback}
      </p>
    </section>
  );
}
