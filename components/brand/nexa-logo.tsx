import { useId } from "react";

import { cn } from "@/lib/cn";

function maskId(prefix: string, raw: string) {
  return `${prefix}-${raw.replace(/:/g, "")}`;
}

const BUBBLE =
  "M14 6h36a8 8 0 0 1 8 8v28a8 8 0 0 1-8 8H28L14 60V50a8 8 0 0 1-8-8V14a8 8 0 0 1 8-8z";
const LETTER_N = "M23 38V18l18 20V18";

function GlyphMask({ id }: { id: string }) {
  return (
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
      <path fill="#fff" d={BUBBLE} />
      <path
        d={LETTER_N}
        fill="none"
        stroke="#000"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </mask>
  );
}

export function NexaGlyph({ className }: { className?: string }) {
  const id = maskId("nexa-glyph", useId());
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <GlyphMask id={id} />
      <rect width="64" height="64" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}

export function NexaAppIcon({ className }: { className?: string }) {
  const id = maskId("nexa-app", useId());
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="15" fill="#4b5563" />
      <g transform="translate(12 12) scale(0.625)">
        <GlyphMask id={id} />
        <rect width="64" height="64" fill="#fff" mask={`url(#${id})`} />
      </g>
    </svg>
  );
}

export function NexaLogo({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <NexaAppIcon className={cn("size-8 shrink-0 sm:size-9", iconClassName)} />
      <span className="font-display text-xl font-extrabold tracking-tight text-zinc-900 max-[399px]:sr-only sm:text-[22px]">
        Nexa
      </span>
    </span>
  );
}
