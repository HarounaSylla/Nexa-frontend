import type { OrderDetail } from "@/lib/orders-api";

const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);

export function formatMoney(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "—";
  }
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) {
    return String(value);
  }
  return `${amount.toLocaleString("fr-FR")} F`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

const DISPLAY_LABELS: Record<string, string> = {
  created: "Créée",
  deliverer_assigned: "Livreur assigné",
  delivered: "Livrée",
  cancelled: "Annulée",
  cash_on_delivery: "Paiement à la livraison",
  online: "Paiement en ligne",
  pending: "En attente",
  paid: "Payée",
};

export function formatEnum(value: string): string {
  return DISPLAY_LABELS[value] ?? value.replaceAll("_", " ");
}

export function isTerminalStatus(status: string): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function canSendPaymentLink(order: OrderDetail): boolean {
  return (
    order.payment_method === "online" &&
    !order.payment_link &&
    !isTerminalStatus(order.status)
  );
}

export function canAssignDeliverer(order: OrderDetail): boolean {
  return !order.deliverer && !isTerminalStatus(order.status);
}

export function canConfirmDelivery(order: OrderDetail): boolean {
  return Boolean(order.deliverer) && !isTerminalStatus(order.status);
}

export function canCancelOrder(order: OrderDetail): boolean {
  return !isTerminalStatus(order.status);
}

const STATUS_ORDER = [
  "created",
  "deliverer_assigned",
  "delivered",
  "cancelled",
];

export function uniqueStatuses(orders: { status: string }[]): string[] {
  const found = new Set(orders.map((order) => order.status));
  const known = STATUS_ORDER.filter((status) => found.has(status));
  const rest = [...found]
    .filter((status) => !STATUS_ORDER.includes(status))
    .sort();
  return [...known, ...rest];
}
