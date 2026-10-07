import type { NotificationItem } from "@/lib/notifications-api";

export function notificationHref(item: NotificationItem | string): string {
  if (typeof item !== "string" && item.type === "payment_proof_received") {
    if (item.related_type === "order") {
      return `/commandes?order=${item.related_id}`;
    }
    return `/conversations?conversation=${item.related_id}`;
  }
  if (typeof item !== "string" && item.type === "escalated_customer_message") {
    return `/conversations?conversation=${item.related_id}`;
  }
  if (typeof item !== "string" && item.type === "product_photo_unrecognized") {
    return `/conversations?conversation=${item.related_id}`;
  }
  const type = typeof item === "string" ? item : item.type;
  if (type === "new_order") {
    return "/commandes";
  }
  if (type === "conversation_escalated") {
    return "/conversations";
  }
  if (type === "product_out_of_stock") {
    return "/catalogue";
  }
  if (type === "escalated_customer_message") {
    return "/conversations";
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
  if (item.type === "escalated_customer_message") {
    return `Nouveau message de ${stringField(data.customer_phone)}`;
  }
  if (item.type === "product_out_of_stock") {
    return `Rupture de stock : ${stringField(data.product_name)}`;
  }
  if (item.type === "payment_proof_received") {
    const title = stringField(data.title);
    if (title !== "—") {
      return title;
    }
    return stringField(data.body);
  }
  if (item.type === "product_photo_unrecognized") {
    const title = stringField(data.title);
    if (title !== "—") {
      return title;
    }
    return stringField(data.body);
  }
  return "Nouvelle notification";
}

export function notificationSecondary(item: NotificationItem): string | null {
  if (item.type === "escalated_customer_message") {
    return "Conversation en escalade : la boutique doit répondre.";
  }
  if (item.type === "product_photo_unrecognized") {
    return "Une vente est peut-être possible : répondez au client.";
  }
  return null;
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
