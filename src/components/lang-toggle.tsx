"use client";

import { useSettings } from "@/contexts/settings-context";
import { PillSwitch } from "@/components/ui/pill-switch";

export function LangToggle() {
  const { language, setLanguage } = useSettings();
  const isEn = language === "en";

  return (
    <PillSwitch
      checked={isEn}
      onCheckedChange={(checked) => setLanguage(checked ? "en" : "id")}
      aria-label={isEn ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
      title={isEn ? "Bahasa Indonesia" : "English"}
      offContent={
        <span className="text-[10px] font-semibold leading-none" aria-hidden="true">
          ID
        </span>
      }
      onContent={
        <span className="text-[10px] font-semibold leading-none" aria-hidden="true">
          EN
        </span>
      }
    />
  );
}
