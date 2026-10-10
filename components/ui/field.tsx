import type {
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";
import { inputClass } from "@/lib/ui";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-800">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-caption text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-caption text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(inputClass, "w-full min-w-0", className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ref,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: Ref<HTMLTextAreaElement>;
}) {
  return (
    <textarea
      ref={ref}
      className={cn(inputClass, "h-auto w-full min-w-0 py-2", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClass, "w-full min-w-0", className)} {...props}>
      {children}
    </select>
  );
}
