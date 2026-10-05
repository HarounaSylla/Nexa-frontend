import type { OrderDetail } from "@/lib/orders-api";
import { displayPaymentLinkError } from "@/lib/payment-links-api";

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
  pending: "Paiement en attente",
  proof_received: "Preuve reçue — à vérifier",
  paid: "Paiement reçu",
};

export function formatEnum(value: string): string {
  return DISPLAY_LABELS[value] ?? value.replaceAll("_", " ");
}

export function formatOrderNumber(orderNumber: number): string {
  return `Commande #${orderNumber}`;
}

export function displayOrderError(message: string): string {
  const delivery = message.match(/^Delivery is not available in (.+)$/);
  if (delivery) {
    return `La livraison n'est pas disponible à ${delivery[1]}.`;
  }
  const stock = message.match(
    /^Insufficient stock for product .+: requested (\d+), available (\d+)$/,
  );
  if (stock) {
    return `Stock insuffisant : ${stock[1]} demandés, ${stock[2]} disponibles.`;
  }
  if (/^Only online-payment orders can be marked as paid/.test(message)) {
    return (
      "Seules les commandes payées en ligne peuvent être marquées comme payées. " +
      "Le paiement à la livraison est enregistré à la confirmation de la livraison."
    );
  }
  if (/^Cannot mark as paid order .+ in status cancelled$/.test(message)) {
    return "Cette commande est annulée : le paiement ne peut pas être enregistré.";
  }
  if (/^This order is already paid$/.test(message)) {
    return "Cette commande est déjà payée.";
  }
  return displayPaymentLinkError(message);
}

export function isTerminalStatus(status: string): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function canSendPaymentLink(order: OrderDetail): boolean {
  return (
    order.payment_method === "online" &&
    order.status !== "cancelled" &&
    order.payment_status !== "paid"
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

export function canMarkPaid(order: OrderDetail): boolean {
  return (
    order.payment_method === "online" &&
    order.payment_status !== "paid" &&
    order.status !== "cancelled"
  );
}

export function canRejectProof(order: OrderDetail): boolean {
  return order.payment_status === "proof_received";
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
