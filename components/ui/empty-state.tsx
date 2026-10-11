import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const emptyStateClass =
  "rounded-card border border-zinc-200/80 bg-white px-4 py-10 text-center text-zinc-500 shadow-card sm:px-5";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(emptyStateClass, className)}>
      {icon ? (
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent-text">
          {icon}
        </div>
      ) : null}
      <p className="font-medium text-zinc-800">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
