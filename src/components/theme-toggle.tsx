"use client";

import { useSettings } from "@/contexts/settings-context";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useSettings();
  const isDark = theme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="px-2"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}