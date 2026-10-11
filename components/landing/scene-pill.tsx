import { cn } from "@/lib/cn";

export function ScenePill({
  tone,
  children,
}: {
  tone: "warning" | "success";
  children: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-px text-[10.5px] font-semibold whitespace-nowrap",
        tone === "warning"
          ? "bg-warning-soft text-warning"
          : "bg-success-soft text-success",
      )}
    >
      <i className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
