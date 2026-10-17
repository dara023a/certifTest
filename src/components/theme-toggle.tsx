"use client";

import { Moon, Sun } from "lucide-react";

import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";
import { PillSwitch } from "@/components/ui/pill-switch";

export function ThemeToggle() {
  const { theme, setTheme, language } = useSettings();
  const t = translations[language];
  const isDark = theme === "dark";

  return (
    <PillSwitch
      checked={isDark}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      aria-label={isDark ? t.switchToLight : t.switchToDark}
      title={isDark ? t.themeLight : t.themeDark}
      offContent={<Sun className="h-3.5 w-3.5" aria-hidden="true" />}
      onContent={<Moon className="h-3.5 w-3.5" aria-hidden="true" />}
    />
  );
}
