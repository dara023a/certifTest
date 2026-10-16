"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, LogIn, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/settings-context";
import {
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_USER,
  isAuthenticated,
  login,
} from "@/lib/admin-auth";
import { translations } from "@/lib/i18n";

export default function AdminLoginPage() {
  const { language } = useSettings();
  const t = translations[language].admin;
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/admin");
    }
  }, [router]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const session = login(username, password);
    if (session) {
      router.replace("/admin");
    } else {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f7ff] p-4 dark:bg-[#0d1345]">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">{t.login.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.login.subtitle}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-5">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>{t.login.title}</AlertTitle>
            <AlertDescription>{t.login.errorInvalid}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              {t.login.username}
            </label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError(false);
              }}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              {t.login.password}
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(false);
              }}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
            {t.login.submit}
          </Button>
        </form>

        <div className="mt-5 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            {t.login.demoHint}
          </p>
          <p className="mt-1.5">
            {t.login.demoCredentials}:{" "}
            <span className="font-mono text-foreground">{DEMO_ADMIN_USER}</span> /{" "}
            <span className="font-mono text-foreground">{DEMO_ADMIN_PASSWORD}</span>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">{t.login.note}</p>

        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t.common.home}
          </Link>
        </p>
      </div>
    </div>
  );
}
