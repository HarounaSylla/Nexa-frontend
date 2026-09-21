import { auth } from "@clerk/nextjs/server";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getMerchantMe } from "@/lib/api";
import { listProducts } from "@/lib/catalogue-api";
import { listConversations } from "@/lib/conversations-api";
import { listNotifications } from "@/lib/notifications-api";
import { listOrders } from "@/lib/orders-api";

export default async function DashboardPage() {
  const { getToken } = await auth.protect();
  const token = await getToken();
  const merchant = await getMerchantMe(token);

  const [orders, conversations, products, notifications] = await Promise.all([
    listOrders(token).catch(() => []),
    listConversations(token).catch(() => []),
    listProducts(token).catch(() => []),
    listNotifications(token).catch(() => []),
  ]);

  return (
    <DashboardView
      shopName={merchant.name}
      orders={orders}
      conversations={conversations}
      products={products}
      initialNotifications={notifications}
    />
  );
}
