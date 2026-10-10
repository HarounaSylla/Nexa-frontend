import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";
import { cardClass } from "@/lib/ui";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(cardClass, "p-4 sm:p-5", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-3 flex flex-col gap-1 sm:mb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-section-title", className)} {...props} />;
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mt-4 flex flex-wrap items-center gap-2 sm:mt-5", className)}>
      {children}
    </div>
  );
}
