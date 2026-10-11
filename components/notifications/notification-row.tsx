import Link from "next/link";
import { AlertTriangle, MessageCircle, Package } from "lucide-react";

import { cn } from "@/lib/cn";
import type { NotificationItem } from "@/lib/notifications-api";
import { focusRingClass } from "@/lib/ui";

import {
  formatRelativeTime,
  notificationKind,
  notificationSecondary,
  notificationSentence,
} from "./notification-copy";

export const NOTIFICATION_LIST_CLASS = "divide-y divide-zinc-200";

const KIND_ICON = {
  order: Package,
  conversation: MessageCircle,
  stock: AlertTriangle,
};

export function NotificationRow({
  item,
  href,
  disabled,
  onClick,
}: {
  item: NotificationItem;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const unread = item.read_at == null;
  const Icon = KIND_ICON[notificationKind(item.type)];
  const secondary = notificationSecondary(item);
  const className = cn(
    "flex min-h-11 w-full items-start gap-3 px-4 py-3 text-left text-sm",
    "motion-safe:transition-colors motion-safe:duration-150",
    focusRingClass,
    unread
      ? "bg-warning-soft font-medium text-zinc-900"
      : "font-normal text-zinc-600 hover:bg-accent-soft",
    disabled && "opacity-60",
  );
  const body = (
    <>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {unread ? (
        <span
          aria-hidden="true"
          className="mt-1.5 size-2 shrink-0 rounded-full bg-warning"
        />
      ) : (
        <span aria-hidden="true" className="mt-1.5 size-2 shrink-0" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block">{notificationSentence(item)}</span>
        {secondary ? (
          <span className="mt-0.5 block text-xs font-normal text-zinc-500">
            {secondary}
          </span>
        ) : null}
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {formatRelativeTime(item.created_at)}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {body}
    </button>
  );
}
