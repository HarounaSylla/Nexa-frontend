"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { errorMessage } from "@/lib/api";
import { displayWhatsAppError } from "@/lib/whatsapp-errors";
import {
  type Deliverer,
  createDeliverer,
  getOrder,
  listDeliverers,
  listOrders,
  type OrderDetail,
  type OrderListItem,
  updateDeliverer,
} from "@/lib/orders-api";
import {
  listPaymentLinks,
  type PaymentLink,
} from "@/lib/payment-links-api";
import {
  bannerErrorClass,
  btnPrimary,
  btnSecondary,
  cardClass,
  cardInteractiveClass,
  emptyStateClass,
  inputClass,
  pageTitleClass,
} from "@/lib/ui";

import { PaymentStatusBadge, StatusBadge } from "./badges";
import { CreateOrderDialog } from "./create-order-dialog";
import { OrderDetailPanel } from "./order-detail-panel";
import {
  canSendPaymentLink,
  displayOrderError,
  formatDate,
  formatEnum,
  formatMoney,
  formatOrderNumber,
  uniqueStatuses,
} from "./order-helpers";

export function OrdersView({
  initialOrders,
  initialError = null,
}: {
  initialOrders: OrderListItem[];
  initialError?: string | null;
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");
  const [orders, setOrders] = useState(initialOrders);
  const [listError, setListError] = useState<string | null>(initialError);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[] | null>(null);
  const [paymentLinksError, setPaymentLinksError] = useState<string | null>(
    null,
  );
  const [paymentLinksLoading, setPaymentLinksLoading] = useState(false);
  const openRequest = useRef(0);
  const pendingNotice = useRef<string | null>(null);
  const paymentLinksRef = useRef<{
    links: PaymentLink[] | null;
    error: string | null;
  }>({ links: null, error: null });

  const statuses = useMemo(() => uniqueStatuses(orders), [orders]);
  const activeFilter =
    statusFilter === "all" || statuses.includes(statusFilter)
      ? statusFilter
      : "all";
  const visibleOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === activeFilter);
  }, [activeFilter, orders]);

  useEffect(() => {
    if (orderParam) {
      void openOrder(orderParam);
      return;
    }
    closeOrderLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open from the query string only
  }, [orderParam]);

  async function loadPaymentLinks(force = false) {
    if (!force && paymentLinksRef.current.links && !paymentLinksRef.current.error) {
      return;
    }
    setPaymentLinksLoading(true);
    try {
      const links = await listPaymentLinks(await getToken());
      paymentLinksRef.current = { links, error: null };
      setPaymentLinks(links);
      setPaymentLinksError(null);
    } catch {
      paymentLinksRef.current = {
        links: paymentLinksRef.current.links,
        error: "Impossible de charger vos liens de paiement.",
      };
      setPaymentLinksError("Impossible de charger vos liens de paiement.");
    } finally {
      setPaymentLinksLoading(false);
    }
  }

  async function openOrder(orderId: string) {
    const requestId = ++openRequest.current;
    const keepNotice = pendingNotice.current;
    pendingNotice.current = null;
    setSelectedId(orderId);
    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);
    setActionError(null);
    setNotice(keepNotice);
    try {
      const token = await getToken();
      const [nextDetail, nextDeliverers] = await Promise.all([
        getOrder(token, orderId),
        listDeliverers(token),
      ]);
      if (requestId !== openRequest.current) {
        return;
      }
      setDetail(nextDetail);
      setDeliverers(nextDeliverers);
      if (canSendPaymentLink(nextDetail)) {
        void loadPaymentLinks();
      }
    } catch (err) {
      if (requestId !== openRequest.current) {
        return;
      }
      setDetailError(errorMessage(err));
    } finally {
      if (requestId === openRequest.current) {
        setDetailLoading(false);
      }
    }
  }

  function closeOrderLocal() {
    openRequest.current += 1;
    setSelectedId(null);
    setDetail(null);
    setDetailLoading(false);
    setDetailError(null);
    setNotice(null);
    setActionError(null);
  }

  function closeOrder() {
    closeOrderLocal();
    if (orderParam) {
      router.push("/commandes");
    }
  }

  async function refreshList(token: string | null) {
    const next = await listOrders(token);
    setOrders(next);
    setListError(null);
  }

  async function runAction(
    action: (token: string | null) => Promise<void>,
    successNotice?: string,
    options?: { refreshOnError?: boolean },
  ) {
    if (!selectedId) {
      return false;
    }
    setActionPending(true);
    setActionError(null);
    setNotice(null);
    try {
      const token = await getToken();
      await action(token);
      const [nextDetail, nextDeliverers] = await Promise.all([
        getOrder(token, selectedId),
        listDeliverers(token),
        refreshList(token),
      ]);
      setDetail(nextDetail);
      setDeliverers(nextDeliverers);
      if (successNotice) {
        setNotice(successNotice);
      }
      return true;
    } catch (err) {
      setActionError(
        displayWhatsAppError(displayOrderError(errorMessage(err))),
      );
      if (options?.refreshOnError) {
        try {
          const token = await getToken();
          const [nextDetail, nextDeliverers] = await Promise.all([
            getOrder(token, selectedId),
            listDeliverers(token),
            refreshList(token),
          ]);
          setDetail(nextDetail);
          setDeliverers(nextDeliverers);
        } catch {
          // Keep the original action error if the refresh fails.
        }
      }
      return false;
    } finally {
      setActionPending(false);
    }
  }

  async function saveDeliverer(
    input: { name: string; phone: string },
    existingId?: string,
  ) {
    const token = await getToken();
    const saved = existingId
      ? await updateDeliverer(token, existingId, input)
      : await createDeliverer(token, input);
    const nextDeliverers = await listDeliverers(token);
    setDeliverers(nextDeliverers);
    setActionError(null);
    setNotice(existingId ? "Livreur modifié." : "Livreur ajouté.");
    if (existingId && detail?.deliverer?.id === existingId) {
      setDetail(await getOrder(token, detail.id));
    }
    return saved;
  }

  if (listError) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <h1 className={pageTitleClass}>Commandes</h1>
        <p className={`mt-6 ${bannerErrorClass}`} role="alert">
          {listError}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className={pageTitleClass}>Commandes</h1>
      <p className="mt-2 text-sm text-zinc-500 tabular-nums">
        {orders.length} commande{orders.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex max-w-xs flex-col gap-1 text-sm font-medium">
          Statut
          <select
            value={activeFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClass}
          >
            <option value="all">Toutes</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatEnum(status)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className={btnPrimary}
        >
          Nouvelle commande
        </button>
      </div>

      {orders.length === 0 ? (
        <div className={`mt-8 ${emptyStateClass}`}>
          <p className="font-medium text-zinc-800">Aucune commande pour le moment</p>
          <p className="mt-1 text-sm">
            Les commandes WhatsApp apparaîtront ici.
          </p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">
          Aucune commande avec ce statut.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {visibleOrders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => router.push(`/commandes?order=${order.id}`)}
                className={`${cardInteractiveClass} flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between`}
              >
                <div className="min-w-0">
                  <p className="font-medium tabular-nums">
                    {formatOrderNumber(order.order_number)}
                  </p>
                  <p className="text-sm text-zinc-500 tabular-nums">
                    {order.customer_phone} · {order.city ?? "Pas de ville"} ·{" "}
                    {order.item_count} article
                    {order.item_count === 1 ? "" : "s"} · {formatMoney(order.total)}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {formatEnum(order.payment_method)} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={order.status} />
                  {order.status !== "cancelled" ? (
                    <PaymentStatusBadge status={order.payment_status} />
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <CreateOrderDialog
          getToken={getToken}
          pending={actionPending}
          onClose={() => setCreating(false)}
          onCreated={async (orderId, orderNumber) => {
            setCreating(false);
            await refreshList(await getToken());
            pendingNotice.current = `${formatOrderNumber(orderNumber)} créée.`;
            router.push(`/commandes?order=${orderId}`);
          }}
        />
      ) : null}

      {selectedId && detailLoading && !detail ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chargement de la commande"
            className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
          >
            <p className="text-sm text-zinc-500">Chargement de la commande…</p>
          </div>
        </div>
      ) : null}

      {selectedId && detailError && !detail ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Erreur de commande"
            className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
          >
            <p className="text-sm text-danger" role="alert">
              {detailError}
            </p>
            <button
              type="button"
              onClick={closeOrder}
              className={`${btnSecondary} mt-4`}
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}

      {detail ? (
        <OrderDetailPanel
          key={detail.id}
          order={detail}
          deliverers={deliverers}
          paymentLinks={paymentLinks}
          paymentLinksError={paymentLinksError}
          paymentLinksLoading={paymentLinksLoading}
          pending={actionPending}
          notice={notice}
          error={actionError}
          onClose={closeOrder}
          onRetryPaymentLinks={() => void loadPaymentLinks(true)}
          onSaveDeliverer={saveDeliverer}
          runAction={runAction}
        />
      ) : null}
    </div>
  );
}
