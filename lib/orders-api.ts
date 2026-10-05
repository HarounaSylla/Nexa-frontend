import { BackendApiError, backendFetch } from "@/lib/api";

export type PaymentStatus = "pending" | "proof_received" | "paid";

export type OrderListItem = {
  id: string;
  order_number: number;
  customer_phone: string;
  city: string | null;
  status: string;
  payment_method: string;
  payment_status: PaymentStatus | string;
  payment_link: string | null;
  item_count: number;
  total: string | number;
  created_at: string;
};

export type OrderProof = {
  id: string;
  classification: string;
  detected_amount: string | number | null;
  created_at: string;
  deleted: boolean;
};

export type OrderLineItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string | number;
};

export type AssignedDeliverer = {
  id: string;
  name: string;
  phone: string;
};

export type OrderDetail = OrderListItem & {
  items: OrderLineItem[];
  deliverer: AssignedDeliverer | null;
  payment_link_sent_at: string | null;
  payment_link_label: string | null;
  conversation_id: string | null;
  proofs: OrderProof[];
};

export type Deliverer = {
  id: string;
  name: string;
  phone: string;
};

export type DeliveryZone = {
  id: string;
  merchant_id: string;
  city: string;
  available: boolean;
  min_delivery_hours: number;
  max_delivery_hours: number;
};

export type CreateOrderInput = {
  customer_phone: string;
  items: { product_id: string; quantity: number }[];
  payment_method: "cash_on_delivery" | "online";
  delivery_address: string;
  ville: string;
};

export type CreatedOrder = {
  id: string;
  order_number: number;
};

export async function listOrders(token: string | null) {
  return backendFetch<OrderListItem[]>("/orders", { token });
}

export async function createOrder(token: string | null, input: CreateOrderInput) {
  return backendFetch<CreatedOrder>("/orders", {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type DeliveryZoneInput = {
  city: string;
  available: boolean;
  min_delivery_hours: number;
  max_delivery_hours: number;
};

export async function listDeliveryZones(token: string | null) {
  return backendFetch<DeliveryZone[]>("/orders/delivery-zones", { token });
}

export async function saveDeliveryZone(
  token: string | null,
  body: DeliveryZoneInput,
) {
  return backendFetch<DeliveryZone>("/orders/delivery-zones", {
    token,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteDeliveryZone(token: string | null, id: string) {
  return backendFetch<null>(`/orders/delivery-zones/${id}`, {
    token,
    method: "DELETE",
  });
}

export async function getOrder(token: string | null, orderId: string) {
  return backendFetch<OrderDetail>(`/orders/${orderId}`, { token });
}

export async function sendPaymentLink(
  token: string | null,
  orderId: string,
  paymentLinkId: string,
) {
  return backendFetch<OrderDetail>(`/orders/${orderId}/send-payment-link`, {
    token,
    method: "POST",
    body: JSON.stringify({ payment_link_id: paymentLinkId }),
  });
}

export async function listDeliverers(token: string | null) {
  return backendFetch<Deliverer[]>("/deliverers", { token });
}

export async function createDeliverer(
  token: string | null,
  input: { name: string; phone: string },
) {
  return backendFetch<Deliverer>("/deliverers", {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateDeliverer(
  token: string | null,
  delivererId: string,
  input: { name: string; phone: string },
) {
  return backendFetch<Deliverer>(`/deliverers/${delivererId}`, {
    token,
    method: "PUT",
    body: JSON.stringify(input),
  });
}

function validationField(detail: unknown): "name" | "phone" | null {
  if (typeof detail !== "object" || detail === null) {
    return null;
  }
  const nested =
    "detail" in detail ? (detail as { detail: unknown }).detail : detail;
  const entries = Array.isArray(nested) ? nested : [nested];
  for (const entry of entries) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }
    const loc = (entry as { loc?: unknown }).loc;
    const parts = Array.isArray(loc) ? loc.map(String) : [];
    if (parts.includes("phone")) {
      return "phone";
    }
    if (parts.includes("name")) {
      return "name";
    }
    const msg = (entry as { msg?: unknown }).msg;
    if (typeof msg === "string" && /phone/i.test(msg)) {
      return "phone";
    }
    if (typeof msg === "string" && /name|character/i.test(msg)) {
      return "name";
    }
  }
  return null;
}

export function delivererErrorFromUnknown(err: unknown): string {
  if (err instanceof BackendApiError) {
    if (err.status === 409) {
      return "Un livreur utilise déjà ce numéro.";
    }
    if (err.status === 404) {
      return "Ce livreur n'existe plus. Actualisez la page.";
    }
    if (err.status === 422) {
      const field = validationField(err.detail);
      if (field === "phone") {
        return "Numéro de téléphone invalide.";
      }
      if (field === "name") {
        return "Indiquez le nom du livreur.";
      }
    }
  }
  return "Impossible d'enregistrer le livreur. Réessayez.";
}

export async function assignDeliverer(
  token: string | null,
  orderId: string,
  delivererId: string,
) {
  return backendFetch<unknown>(`/orders/${orderId}/assign-deliverer`, {
    token,
    method: "POST",
    body: JSON.stringify({ deliverer_id: delivererId }),
  });
}

export async function confirmDelivery(token: string | null, orderId: string) {
  return backendFetch<unknown>(`/orders/${orderId}/confirm-delivery`, {
    token,
    method: "POST",
  });
}

export async function markOrderPaid(token: string | null, orderId: string) {
  return backendFetch<OrderDetail>(`/orders/${orderId}/mark-paid`, {
    token,
    method: "POST",
  });
}

export async function rejectProof(token: string | null, orderId: string) {
  return backendFetch<OrderDetail>(`/orders/${orderId}/reject-proof`, {
    token,
    method: "POST",
  });
}

export async function cancelOrder(token: string | null, orderId: string) {
  return backendFetch<unknown>(`/orders/${orderId}/cancel`, {
    token,
    method: "POST",
  });
}
