"use client";

import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";
import { LangToggle } from "@/components/lang-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Grouped language + theme controls using the shared PillSwitch style.
 * Kept as a reusable cluster; the navbar renders the toggles inline.
 */
export function SettingsBar() {
  const { language } = useSettings();
  const t = translations[language];

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{t.language}</span>
      <LangToggle />
      <ThemeToggle />
    </div>
  );
}
