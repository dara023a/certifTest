"use client";

import { Moon, Sun } from "lucide-react";

import { useSettings } from "@/contexts/settings-context";
import { PillSwitch } from "@/components/ui/pill-switch";

export function ThemeToggle() {
  const { theme, setTheme } = useSettings();
  const isDark = theme === "dark";

  return (
    <PillSwitch
      checked={isDark}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      offContent={<Sun className="h-3.5 w-3.5" aria-hidden="true" />}
      onContent={<Moon className="h-3.5 w-3.5" aria-hidden="true" />}
    />
  );
}
