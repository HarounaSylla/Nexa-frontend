import { cn } from "@/lib/cn";
import { cardClass } from "@/lib/ui";

export type StatTone = "neutral" | "info" | "success" | "danger" | "warning";

const DOT: Record<StatTone, string> = {
  neutral: "bg-accent-text",
  info: "bg-info",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
};

export function StatTile({
  label,
  value,
  context,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string | number;
  context?: string;
  tone?: StatTone;
  className?: string;
}) {
  return (
    <div className={cn(cardClass, "p-4", className)}>
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
    </div>
  );
}
