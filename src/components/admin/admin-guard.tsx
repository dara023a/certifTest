"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { isAuthenticated } from "@/lib/admin-auth";

const emptySubscribe = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

/**
 * Client-side auth guard. Redirects to /admin/login when no demo session exists.
 * This is NOT a security boundary — see src/lib/admin-auth.ts.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isClient = useSyncExternalStore(emptySubscribe, alwaysTrue, alwaysFalse);
  const authed = useSyncExternalStore(emptySubscribe, isAuthenticated, alwaysFalse);

  useEffect(() => {
    if (isClient && !authed) {
      router.replace("/admin/login");
    }
  }, [isClient, authed, router]);

  if (!isClient || !authed) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        <span role="status">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
