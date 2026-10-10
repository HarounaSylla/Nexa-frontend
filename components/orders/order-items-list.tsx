import type { OrderLineItem } from "@/lib/orders-api";

import { formatMoney } from "./order-helpers";

export function OrderItemsList({
  items,
  total,
}: {
  items: OrderLineItem[];
  total: string | number;
}) {
  return (
    <section className="border-t border-zinc-100 pt-5">
      <h3 className="text-section-title text-sm">Articles</h3>
      <ul className="mt-2 divide-y divide-zinc-100">
        {items.map((item, index) => (
          <li
            key={`${item.product_id}-${index}`}
            className="flex items-start justify-between gap-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium">{item.product_name}</p>
              <p className="text-zinc-500 tabular-nums">
                {item.quantity} × {formatMoney(item.unit_price)}
              </p>
            </div>
            <p className="shrink-0 font-medium tabular-nums">
              {formatMoney(Number(item.unit_price) * item.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-right text-sm font-semibold tabular-nums">
        Total {formatMoney(total)}
      </p>
    </section>
  );
}
