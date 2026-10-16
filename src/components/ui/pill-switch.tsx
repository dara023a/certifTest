"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface PillSwitchProps {
  /** Whether the switch is in the "on" (right) position. */
  checked: boolean;
  /** Called with the next checked value when the user toggles. */
  onCheckedChange: (checked: boolean) => void;
  /** Accessible name for the control. */
  "aria-label": string;
  /** Optional tooltip text. */
  title?: string;
  /** Content rendered inside the thumb when off (thumb on the left). */
  offContent?: React.ReactNode;
  /** Content rendered inside the thumb when on (thumb on the right). */
  onContent?: React.ReactNode;
  className?: string;
}

/**
 * A minimal, accessible toggle (pill switch).
 * Native <button> handles Enter/Space activation for free.
 */
export function PillSwitch({
  checked,
  onCheckedChange,
  offContent,
  onContent,
  className,
  title,
  "aria-label": ariaLabel,
}: PillSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted transition-colors",
        "[@media(pointer:coarse)]:h-11",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-0.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-background shadow-sm",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          checked ? "translate-x-[24px]" : "translate-x-0"
        )}
      >
        {checked ? onContent : offContent}
      </span>
    </button>
  );
}
