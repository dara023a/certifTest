"use client";

import { useSettings } from "@/contexts/settings-context";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LangToggle() {
  const { language, setLanguage } = useSettings();
  const isId = language === "id";
  const toggle = () => setLanguage(isId ? "en" : "id");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="px-2"
      title={isId ? "Switch to English" : "Pindah ke Bahasa Indonesia"}
      aria-label={isId ? "Switch to English" : "Pindah ke Bahasa Indonesia"}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs">{isId ? "ID" : "EN"}</span>
    </Button>
  );
}