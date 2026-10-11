import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import {
  PaymentStatusBadge,
  StatusBadge,
} from "@/components/orders/badges";
import { formatMoney } from "@/components/orders/order-helpers";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import type { OrderListItem } from "@/lib/orders-api";
import { focusRingClass } from "@/lib/ui";

export function RecentOrdersCard({ orders }: { orders: OrderListItem[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-section-title">Commandes récentes</h2>
        <Link
          href="/commandes"
          className="text-sm font-medium text-accent hover:underline"
        >
          Voir tout
        </Link>
      </div>
      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-5" aria-hidden="true" />}
          title="Aucune commande pour le moment"
          description="Les commandes WhatsApp apparaîtront ici."
        />
      ) : (
        <Card flush className="overflow-hidden">
          <ul className="divide-y divide-zinc-100">
            {orders.map((order) => {
              const showPayment =
                order.status !== "cancelled" && order.payment_status !== "paid";
              return (
                <li key={order.id}>
                  <Link
                    href={`/commandes?order=${order.id}`}
                    className={cn(
                      "flex min-h-11 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                      "hover:bg-accent-soft motion-safe:transition-colors motion-safe:duration-150",
                      focusRingClass,
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-medium tabular-nums text-zinc-900">
                        Commande #{order.order_number}
                      </p>
                      <p className="text-sm tabular-nums text-zinc-500">
                        {order.city ?? "Pas de ville"} · {order.item_count}{" "}
                        article{order.item_count === 1 ? "" : "s"}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {order.customer_phone}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                      <p className="font-bold tabular-nums text-zinc-900">
                        {formatMoney(order.total)}
                      </p>
                      <StatusBadge status={order.status} />
                      {showPayment ? (
                        <PaymentStatusBadge status={order.payment_status} />
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
