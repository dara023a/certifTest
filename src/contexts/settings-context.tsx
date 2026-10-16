"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, Theme } from "@/lib/types";

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY_LANG = "cert-verify-lang";
const STORAGE_KEY_THEME = "cert-verify-theme";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("id");
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(() => true);
  }, []);

  useEffect(() => {
    if (mounted) return;
    try {
      const lang = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
      const th = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
      if (lang === "id" || lang === "en") {
        setLanguage(lang);
      }
      if (th === "light" || th === "dark") {
        setTheme(th);
      }
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, language);
    } catch (error) {
      console.error(error);
    }
  }, [language, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (error) {
      console.error(error);
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}