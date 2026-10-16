"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Language, Theme } from "@/lib/types";

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface SettingsState {
  language: Language;
  theme: Theme;
  mounted: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY_LANG = "cert-verify-lang";
const STORAGE_KEY_THEME = "cert-verify-theme";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>({
    language: "id",
    theme: "dark",
    mounted: false,
  });

  // Restore persisted preferences once, after mount (client-only APIs).
  useEffect(() => {
    let language: Language = "id";
    let theme: Theme = "dark";
    try {
      const storedLang = localStorage.getItem(STORAGE_KEY_LANG);
      const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (storedLang === "id" || storedLang === "en") {
        language = storedLang;
      }
      if (storedTheme === "light" || storedTheme === "dark") {
        theme = storedTheme;
      }
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ language, theme, mounted: true });
  }, []);

  // Synchronize preferences to external systems (storage + <html>).
  useEffect(() => {
    if (!state.mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, state.language);
      localStorage.setItem(STORAGE_KEY_THEME, state.theme);
    } catch (error) {
      console.error(error);
    }
    document.documentElement.lang = state.language;
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.language, state.theme, state.mounted]);

  const setLanguage = useCallback((language: Language) => {
    setState((prev) => ({ ...prev, language }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  const value = useMemo(
    () => ({ language: state.language, setLanguage, theme: state.theme, setTheme }),
    [state.language, state.theme, setLanguage, setTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
