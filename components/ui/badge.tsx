import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "danger"
  | "warning"
  | "muted";

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-accent-soft text-accent-text",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  muted: "bg-zinc-100 text-zinc-500",
};

const DOT_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-accent-text",
  info: "bg-info",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
  muted: "bg-zinc-400",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: string;
}) {
  return (
    <Badge tone={tone}>
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", DOT_CLASS[tone])}
      />
      {children}
    </Badge>
  );
}
