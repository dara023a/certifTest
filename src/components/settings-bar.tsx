"use client";

import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe, Moon, Sun } from "lucide-react";

export function SettingsBar() {
  const { language, setLanguage, theme, setTheme } = useSettings();
  const t = translations[language];
  const toggleLanguage = () => setLanguage(language === "id" ? "en" : "id");
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className="px-2 text-xs"
        title={t.language}
      >
        <Globe className="h-4 w-4" />
        <span>{language === "id" ? "ID" : "EN"}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="px-2 text-xs"
        title={t.theme}
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="sr-only sm:not-sr-only">
          {theme === "light" ? t.themeDark : t.themeLight}
        </span>
      </Button>
    </div>
  );
}