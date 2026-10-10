import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { PaymentStatusBadge } from "@/components/orders/badges";
import { formatEnum } from "@/components/orders/order-helpers";
import type { ConversationListItem } from "@/lib/conversations-api";
import { cn } from "@/lib/cn";

import { ConversationStatusBadge } from "./status-badge";
import { isClosed } from "./helpers";
import { ConversationAvatar } from "./conversation-avatar";

export function ThreadHeader({
  conversation,
  titleId,
  onClose,
}: {
  conversation: ConversationListItem;
  titleId: string;
  onClose: () => void;
}) {
  const orders = conversation.orders ?? [];

  return (
    <div className="shrink-0 border-b border-zinc-100 bg-white">
      <div className="flex items-center gap-2 px-2 py-2 sm:px-3">
        <IconButton label="Fermer" onClick={onClose}>
          <ArrowLeft className="size-5" aria-hidden="true" />
        </IconButton>
        <ConversationAvatar
          phone={conversation.customer_phone}
          escalated={conversation.status === "escalated"}
        />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate font-display text-sm font-bold text-zinc-900">
            {conversation.customer_phone}
          </h2>
          <div className="mt-0.5">
            <ConversationStatusBadge status={conversation.status} />
          </div>
        </div>
      </div>
      {isClosed(conversation.status) || orders.length > 0 ? (
        <div className="flex flex-col gap-1.5 border-t border-zinc-100 px-3 py-2">
          {isClosed(conversation.status) ? (
            <p className="text-caption text-zinc-500">
              Conversation fermée — si le client écrit à nouveau, un nouveau fil
              sera créé automatiquement.
            </p>
          ) : null}
          {orders.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/commandes?order=${order.id}`}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-control border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-800",
                    "motion-safe:transition-colors motion-safe:duration-150",
                  )}
                >
                  #{order.order_number} · {formatEnum(order.status)}
                  {order.status !== "cancelled" ? (
                    <PaymentStatusBadge status={order.payment_status} />
                  ) : null}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
