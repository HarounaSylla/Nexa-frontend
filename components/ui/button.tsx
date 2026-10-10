"use client";

import Link from "next/link";
import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

const motionClass =
  "motion-safe:transition-[background-color,color,box-shadow,opacity,border-color] motion-safe:duration-150";

const VARIANT: Record<string, string> = {
  primary: "bg-accent text-white shadow-card hover:bg-accent-text active:bg-accent-text",
  secondary:
    "border border-zinc-200 bg-white text-zinc-800 hover:bg-accent-soft active:bg-accent-soft",
  ghost: "text-zinc-800 hover:bg-accent-soft active:bg-accent-soft",
  danger: "bg-danger text-white shadow-card hover:bg-danger/90 active:bg-danger/90",
};

const SIZE: Record<string, string> = {
  sm: "h-11 min-h-11 px-3 text-sm sm:h-10 sm:min-h-10",
  md: "h-11 min-h-11 px-4 text-sm",
  lg: "h-12 min-h-12 px-5 text-sm",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  href?: string;
  asChild?: boolean;
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-control font-medium disabled:opacity-60",
    focusRingClass,
    motionClass,
    VARIANT[variant ?? "primary"],
    SIZE[size ?? "md"],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  href,
  asChild = false,
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = buttonClassName({ variant, size, className });
  const content = (
    <>
      {loading ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : icon ? (
        <span className="inline-flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </>
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; children?: ReactNode }>;
    return cloneElement(child, {
      className: cn(classes, child.props.className),
      children: (
        <>
          {loading ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : icon ? (
            <span className="inline-flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          {child.props.children}
        </>
      ),
    });
  }

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || loading || undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
