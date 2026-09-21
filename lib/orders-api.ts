import { backendFetch } from "@/lib/api";

export type OrderListItem = {
  id: string;
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

export async function listOrders(token: string | null) {
  return backendFetch<OrderListItem[]>("/orders", { token });
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

export async function cancelOrder(token: string | null, orderId: string) {
  return backendFetch<unknown>(`/orders/${orderId}/cancel`, {
    token,
    method: "POST",
  });
}
