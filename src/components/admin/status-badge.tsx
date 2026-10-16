import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  labels,
}: {
  status: "valid" | "revoked";
  labels: { valid: string; revoked: string };
}) {
  const isValid = status === "valid";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isValid ? "bg-emerald-700 text-white" : "bg-red-600 text-white"
      )}
    >
      {isValid ? labels.valid : labels.revoked}
    </span>
  );
}

export function TypeBadge({
  type,
  labels,
}: {
  type: "webinar" | "internship";
  labels: { webinar: string; internship: string };
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground">
      {type === "webinar" ? labels.webinar : labels.internship}
    </span>
  );
}
