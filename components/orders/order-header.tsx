import { ArrowLeft, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import type { OrderDetail } from "@/lib/orders-api";

import { PaymentStatusBadge, StatusBadge } from "./badges";
import { formatDate, formatOrderNumber } from "./order-helpers";

export function OrderHeader({
  order,
  titleId,
  onClose,
}: {
  order: OrderDetail;
  titleId: string;
  onClose: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 shrink-0 border-b border-zinc-100 bg-white">
      <div className="flex items-center gap-2 px-2 py-2 sm:px-3">
        <IconButton label="Fermer" onClick={onClose}>
          <ArrowLeft className="size-5" aria-hidden="true" />
        </IconButton>
        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className="truncate font-display text-sm font-bold tabular-nums text-zinc-900"
          >
            {formatOrderNumber(order.order_number)}
          </h2>
          <p className="truncate text-caption text-zinc-500">
            {order.customer_phone} · {formatDate(order.created_at)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
        <StatusBadge status={order.status} />
        {order.status !== "cancelled" ? (
          <PaymentStatusBadge status={order.payment_status} />
        ) : null}
        {order.conversation_id ? (
          <Button
            variant="ghost"
            size="sm"
            href={`/conversations?conversation=${order.conversation_id}`}
            icon={<MessageCircle className="size-4" />}
          >
            Voir la conversation
          </Button>
        ) : null}
      </div>
    </div>
  );
}
