"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

import { StatusBadge } from "@/components/orders/badges";
import { formatMoney } from "@/components/orders/order-helpers";
import {
  formatRelativeTime,
  notificationSecondary,
  notificationSentence,
  unreadCount,
} from "@/components/notifications/notification-copy";
import type { CatalogueProduct } from "@/lib/catalogue-api";
import type { ConversationListItem } from "@/lib/conversations-api";
import {
  markAllNotificationsRead,
  type NotificationItem,
} from "@/lib/notifications-api";
import type { OrderListItem } from "@/lib/orders-api";
import {
  cardClass,
  cardInteractiveClass,
  emptyStateClass,
  formatDashboardDate,
  pageTitleClass,
  sectionTitleClass,
} from "@/lib/ui";

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

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className={pageTitleClass}>Bon retour, {shopName}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {`Voici ce qui compte aujourd'hui, ${formatDashboardDate()}.`}
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Commandes à traiter"
          value={createdCount}
          context={"Statut « Créée », en attente d'un livreur"}
          dot="warning"
        />
        <StatTile
          label="Livraisons en cours"
          value={inProgressCount}
          context="Livreur assigné, pas encore confirmées"
          dot="info"
        />
        <StatTile
          label="Conversations escaladées"
          value={escalatedCount}
          context={"En attente d'une réponse de votre part"}
          dot="danger"
        />
        <StatTile
          label="Produits en rupture"
          value={outOfStockCount}
          context={`Sur ${products.length} produits au catalogue`}
          dot={outOfStockCount > 0 ? "danger" : "success"}
        />
      </ul>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={sectionTitleClass}>Commandes récentes</h2>
            <Link
              href="/commandes"
              className="text-sm font-medium text-accent hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className={`mt-4 ${emptyStateClass}`}>
              <p className="font-medium text-zinc-800">Aucune commande pour le moment</p>
              <p className="mt-1 text-sm">
                Les commandes WhatsApp apparaîtront ici.
              </p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href="/commandes"
                    className={`${cardInteractiveClass} flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{order.customer_phone}</p>
                      <p className="text-sm text-zinc-500 tabular-nums">
                        {order.city ?? "Pas de ville"} · {order.item_count} article
                        {order.item_count === 1 ? "" : "s"} · {formatMoney(order.total)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={sectionTitleClass}>Notifications</h2>
            {unread > 0 ? (
              <button
                type="button"
                disabled={pending}
                onClick={onMarkAllRead}
                className="text-sm font-medium text-accent hover:underline disabled:opacity-60"
              >
                Tout marquer comme lu
              </button>
            ) : null}
          </div>
          {recentNotifications.length === 0 ? (
            <div className={`mt-4 ${emptyStateClass}`}>
              <p className="font-medium text-zinc-800">
                Aucune notification pour le moment
              </p>
              <p className="mt-1 text-sm">
                Les alertes de commandes, conversations et stock apparaîtront ici.
              </p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {recentNotifications.map((item) => {
                const unreadItem = item.read_at == null;
                return (
                  <li
                    key={item.id}
                    className={`${cardClass} px-3 py-3 text-sm ${
                      unreadItem ? "bg-warning-soft" : ""
                    }`}
                  >
                    <p className={unreadItem ? "font-medium text-zinc-900" : "text-zinc-600"}>
                      {notificationSentence(item)}
                    </p>
                    {notificationSecondary(item) ? (
                      <p className="mt-0.5 text-xs font-normal text-zinc-500">
                        {notificationSecondary(item)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  context,
  dot,
}: {
  label: string;
  value: number;
  context: string;
  dot: "warning" | "info" | "danger" | "success";
}) {
  const dotClass = {
    warning: "bg-warning",
    info: "bg-info",
    danger: "bg-danger",
    success: "bg-success",
  }[dot];

  return (
    <li className={`${cardClass} p-4`}>
      <p className="flex items-center gap-2 text-sm font-medium text-zinc-500">
        <span aria-hidden="true" className={`size-[7px] shrink-0 rounded-full ${dotClass}`} />
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-zinc-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{context}</p>
    </li>
  );
}
