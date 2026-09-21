import type { NotificationItem } from "@/lib/notifications-api";

export function notificationHref(type: string): string {
  if (type === "new_order") {
    return "/commandes";
  }
  if (type === "conversation_escalated") {
    return "/conversations";
  }
  if (type === "product_out_of_stock") {
    return "/catalogue";
  }
  return "/dashboard";
}

export function notificationSentence(item: NotificationItem): string {
  const data = item.data ?? {};
  if (item.type === "new_order") {
    const phone = stringField(data.customer_phone);
    return `Nouvelle commande de ${phone} — ${formatTotal(data.total)} F`;
  }
  if (item.type === "conversation_escalated") {
    return `Conversation escaladée avec ${stringField(data.customer_phone)}`;
  }
  if (item.type === "product_out_of_stock") {
    return `Rupture de stock : ${stringField(data.product_name)}`;
  }
  return item.type;
}

function stringField(value: unknown): string {
  if (value == null) {
    return "—";
  }
  return String(value);
}

function formatTotal(value: unknown): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) {
    return stringField(value);
  }
  return amount.toLocaleString("fr-FR");
}

export function unreadCount(items: NotificationItem[]): number {
  return items.filter((item) => item.read_at == null).length;
}

export function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const deltaMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(deltaMs / 60_000));
  if (minutes < 1) {
    return "à l'instant";
  }
  if (minutes < 60) {
    return `il y a ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `il y a ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}
