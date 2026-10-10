import { cn } from "@/lib/cn";
import { shopInitial } from "@/lib/ui";

export function ShopMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-accent to-accent-text font-display text-[13px] font-bold text-white"
    >
      {shopInitial(name)}
    </span>
  );
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-accent-soft font-display font-bold text-accent-text",
        size === "sm" ? "size-8 text-xs" : "size-10 text-sm",
      )}
    >
      {shopInitial(name)}
    </span>
  );
}

export function ShopAvatar({ name }: { name: string }) {
  return <Avatar name={name} />;
}
