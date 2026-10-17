"use client";

import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";
import { PillSwitch } from "@/components/ui/pill-switch";

export function LangToggle() {
  const { language, setLanguage } = useSettings();
  const t = translations[language];
  const isEn = language === "en";

  return (
    <PillSwitch
      checked={isEn}
      onCheckedChange={(checked) => setLanguage(checked ? "en" : "id")}
      aria-label={isEn ? t.switchToIndonesian : t.switchToEnglish}
      title={isEn ? "Bahasa Indonesia" : "English"}
      offContent={
        <span className="text-xs font-semibold leading-none" aria-hidden="true">
          ID
        </span>
      }
      onContent={
        <span className="text-xs font-semibold leading-none" aria-hidden="true">
          EN
        </span>
      }
    />
  );
}
