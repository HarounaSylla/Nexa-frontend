import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { emptyStateClass } from "@/lib/ui";

export function EmptyState({
  icon,
  title,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
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
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
