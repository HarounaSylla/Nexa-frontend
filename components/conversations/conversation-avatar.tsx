import { User } from "lucide-react";

import { cn } from "@/lib/cn";

export function ConversationAvatar({
  phone,
  escalated = false,
}: {
  phone: string;
  escalated?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      title={phone}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text",
        escalated && "ring-2 ring-warning ring-offset-2 ring-offset-white",
      )}
    >
      <User className="size-5" strokeWidth={1.75} />
    </span>
  );
}
