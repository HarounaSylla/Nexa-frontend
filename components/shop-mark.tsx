import { shopInitial } from "@/lib/ui";

export function ShopMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-[26px] shrink-0 items-center justify-center bg-gradient-to-br from-accent to-accent-text font-display text-[13px] font-bold text-white"
      style={{ borderRadius: 7 }}
    >
      {shopInitial(name)}
    </span>
  );
}

export function ShopAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-10 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent-text"
    >
      {shopInitial(name)}
    </span>
  );
}
