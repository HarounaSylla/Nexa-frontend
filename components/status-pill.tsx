type Tone = "neutral" | "info" | "success" | "danger" | "warning";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-accent-soft text-accent-text",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
};

const DOT_CLASS: Record<Tone, string> = {
  neutral: "bg-accent-text",
  info: "bg-info",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
};

export function StatusPill({
  tone,
  children,
}: {
  tone: Tone;
  children: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[tone]}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${DOT_CLASS[tone]}`}
      />
      {children}
    </span>
  );
}
