"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({
  children,
  ...props
}: DialogPrimitive.DialogTriggerProps) {
  return <DialogPrimitive.Trigger {...props}>{children}</DialogPrimitive.Trigger>;
}

export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-dialog bg-black/40 motion-safe:transition-opacity" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-dialog max-h-[90dvh] overflow-y-auto rounded-t-sheet border border-zinc-200/80 bg-white p-4 shadow-card-hover sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-card sm:p-5",
          "motion-safe:transition-transform motion-safe:duration-200",
          focusRingClass,
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogPrimitive.Title className="text-section-title">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-zinc-500">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">
                {title}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Fermer"
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-zinc-600 hover:bg-accent-soft",
              "motion-safe:transition-colors motion-safe:duration-150",
              focusRingClass,
            )}
          >
            <X className="size-5" aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
