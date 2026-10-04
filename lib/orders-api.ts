import { backendFetch } from "@/lib/api";

export type OrderListItem = {
  id: string;
  order_number: number;
  customer_phone: string;
  city: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_link: string | null;
  item_count: number;
  total: string | number;
  created_at: string;
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

export async function setPaymentLink(
  token: string | null,
  orderId: string,
  paymentLink: string,
) {
  return backendFetch<OrderDetail>(`/orders/${orderId}/payment-link`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ payment_link: paymentLink }),
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

export async function cancelOrder(token: string | null, orderId: string) {
  return backendFetch<unknown>(`/orders/${orderId}/cancel`, {
    token,
    method: "POST",
  });
}
