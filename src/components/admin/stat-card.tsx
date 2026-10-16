import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "valid" | "revoked" | "webinar" | "internship" | "activity";
  loading?: boolean;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  valid: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  revoked: "bg-destructive/10 text-destructive",
  webinar: "bg-primary/10 text-primary",
  internship: "bg-[#242cab]/10 text-[#242cab] dark:text-[#a9b4ff]",
  activity: "bg-[#1348a4]/10 text-[#1348a4] dark:text-[#9dc0ff]",
};

export function StatCard({ label, value, icon: Icon, tone = "default", loading }: StatCardProps) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            toneClasses[tone]
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
        {loading ? <span className="text-muted-foreground/50">—</span> : value}
      </p>
    </div>
  );
}
