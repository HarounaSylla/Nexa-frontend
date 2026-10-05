import { Suspense } from "react";

import { auth } from "@clerk/nextjs/server";

import { OrdersView } from "@/components/orders/orders-view";
import { errorMessage } from "@/lib/api";
import { listOrders, type OrderListItem } from "@/lib/orders-api";

export default async function CommandesPage() {
  const { getToken } = await auth.protect();
  const token = await getToken();

  let orders: OrderListItem[] = [];
  let initialError: string | null = null;
  try {
    orders = await listOrders(token);
  } catch (error) {
    initialError = errorMessage(error);
  }

  return (
    <Suspense>
      <OrdersView initialOrders={orders} initialError={initialError} />
    </Suspense>
  );
}
