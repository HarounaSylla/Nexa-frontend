"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

import { AttentionList } from "@/components/dashboard/attention-list";
import { NotificationsCard } from "@/components/dashboard/notifications-card";
import { RecentOrdersCard } from "@/components/dashboard/recent-orders-card";
import { unreadCount } from "@/components/notifications/notification-copy";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import type { CatalogueProduct } from "@/lib/catalogue-api";
import type { ConversationListItem } from "@/lib/conversations-api";
import {
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/notifications-api";
import type { OrderListItem } from "@/lib/orders-api";
import { formatDashboardDate } from "@/lib/ui";

export function DashboardView({
  shopName,
  orders,
  conversations,
  products,
  initialNotifications,
}: {
  shopName: string;
  orders: OrderListItem[];
  conversations: ConversationListItem[];
  products: CatalogueProduct[];
  initialNotifications: NotificationItem[];
}) {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [pending, setPending] = useState(false);

  const createdCount = orders.filter((order) => order.status === "created").length;
  const inProgressCount = orders.filter(
    (order) => order.status === "deliverer_assigned",
  ).length;
  const escalatedCount = conversations.filter(
    (row) => row.status === "escalated",
  ).length;
  const outOfStockCount = products.filter(
    (product) => product.stock_qty === 0,
  ).length;
  const proofCount = orders.filter(
    (order) =>
      order.status !== "cancelled" && order.payment_status === "proof_received",
  ).length;

  const recentOrders = orders.slice(0, 4);
  const recentNotifications = notifications.slice(0, 3);
  const unread = unreadCount(notifications);

  async function onMarkAllRead() {
    setPending(true);
    try {
      await markAllNotificationsRead(await getToken());
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((row) => (row.read_at ? row : { ...row, read_at: now })),
      );
    } finally {
      setPending(false);
    }
  }

  async function onMarkRead(item: NotificationItem) {
    try {
      const updated = await markNotificationRead(await getToken(), item.id);
      setNotifications((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch {
      // Navigation still proceeds from the link; the bell surfaces API errors.
    }
  }

  return (
    <div className="w-full">
      <PageHeader
        title={`Bon retour, ${shopName}`}
        subtitle={`Voici ce qui compte aujourd'hui, ${formatDashboardDate()}.`}
      />

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <li>
          <StatTile
            href="/commandes"
            label="Commandes à traiter"
            value={createdCount}
            context={"Statut « Créée », en attente d'un livreur"}
            tone="warning"
          />
        </li>
        <li>
          <StatTile
            href="/commandes"
            label="Livraisons en cours"
            value={inProgressCount}
            context="Livreur assigné, pas encore confirmées"
            tone="info"
          />
        </li>
        <li>
          <StatTile
            href="/conversations"
            label="Conversations escaladées"
            value={escalatedCount}
            context={"En attente d'une réponse de votre part"}
            tone="danger"
          />
        </li>
        <li>
          <StatTile
            href="/catalogue"
            label="Produits en rupture"
            value={outOfStockCount}
            context={`Sur ${products.length} produits au catalogue`}
            tone={outOfStockCount > 0 ? "danger" : "success"}
          />
        </li>
      </ul>

      <AttentionList
        proofCount={proofCount}
        escalatedCount={escalatedCount}
        outOfStockCount={outOfStockCount}
      />

      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <RecentOrdersCard orders={recentOrders} />
        <NotificationsCard
          items={recentNotifications}
          unread={unread}
          pending={pending}
          onMarkAllRead={() => void onMarkAllRead()}
          onMarkRead={(item) => void onMarkRead(item)}
        />
      </div>
    </div>
  );
}
