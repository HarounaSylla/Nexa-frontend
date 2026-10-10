"use client";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

export function IconButton({
  label,
  children,
  className,
  type = "button",
  ref,
  ...props
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full text-zinc-700 hover:bg-accent-soft active:bg-accent-soft disabled:opacity-60",
        "motion-safe:transition-colors motion-safe:duration-150",
        focusRingClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
