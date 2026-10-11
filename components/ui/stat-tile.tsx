import Link from "next/link";

import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

export type StatTone = "neutral" | "info" | "success" | "danger" | "warning";

const DOT: Record<StatTone, string> = {
  neutral: "bg-accent-text",
  info: "bg-info",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
};

const tileClass =
  "block min-h-11 rounded-card border border-zinc-200/80 bg-white p-4 shadow-card";

export function StatTile({
  label,
  value,
  context,
  tone = "neutral",
  href,
  className,
}: {
  label: string;
  value: string | number;
  context?: string;
  tone?: StatTone;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <p className="flex items-start gap-2 text-sm font-medium text-zinc-500">
        <span
          aria-hidden="true"
          className={cn("mt-[0.45em] size-[7px] shrink-0 rounded-full", DOT[tone])}
        />
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-zinc-900">
        {value}
      </p>
      {context ? <p className="mt-1 text-caption text-zinc-500">{context}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          tileClass,
          "hover:shadow-card-hover motion-safe:transition-shadow motion-safe:duration-150",
          focusRingClass,
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={cn(tileClass, className)}>{content}</div>;
}
