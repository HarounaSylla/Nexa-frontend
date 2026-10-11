"use client";

import { useAuth } from "@clerk/nextjs";
import { Plus, Search, ShoppingBag, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
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
import { bannerErrorClass, focusRingClass } from "@/lib/ui";

import { PaymentStatusBadge, StatusBadge } from "./badges";
import { CreateOrderDialog } from "./create-order-dialog";
import { OrderDetailPanel } from "./order-detail-panel";
import {
  canSendPaymentLink,
  displayOrderError,
  formatEnum,
  formatMoney,
  formatOrderNumber,
  formatShortDate,
  needsAttention,
  ORDER_STATUS_FILTERS,
  orderMatchesQuery,
  PAYMENT_STATUS_FILTERS,
} from "./order-helpers";

function toggleValue(current: Set<string>, value: string): Set<string> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function FilterChipRow({
  label,
  values,
  selected,
  counts,
  onToggle,
}: {
  label: string;
  values: readonly string[];
  selected: Set<string>;
  counts: Record<string, number>;
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-caption text-zinc-500">{label}</p>
      <div className="relative mt-1">
        <div
          role="group"
          aria-label={label}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {values.map((value) => {
            const pressed = selected.has(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={pressed}
                onClick={() => onToggle(value)}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium tabular-nums",
                  "motion-safe:transition-colors motion-safe:duration-150",
                  focusRingClass,
                  pressed
                    ? "bg-accent text-white"
                    : "bg-accent-soft text-accent-text hover:bg-zinc-200",
                )}
              >
                {formatEnum(value)}
                <span className={pressed ? "text-white/80" : "text-zinc-500"}>
                  {counts[value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent"
        />
      </div>
    </div>
  );
}

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
  const [statusFilters, setStatusFilters] = useState<Set<string>>(
    () => new Set(),
  );
  const [paymentFilters, setPaymentFilters] = useState<Set<string>>(
    () => new Set(),
  );
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[] | null>(null);
  const [paymentLinksError, setPaymentLinksError] = useState<string | null>(
    null,
  );
  const [paymentLinksLoading, setPaymentLinksLoading] = useState(false);
  const openRequest = useRef(0);
  const paymentLinksRef = useRef<{
    links: PaymentLink[] | null;
    error: string | null;
  }>({ links: null, error: null });

  const filtersActive =
    query.trim() !== "" || statusFilters.size > 0 || paymentFilters.size > 0;
  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilters.size > 0 && !statusFilters.has(order.status)) {
        return false;
      }
      if (paymentFilters.size > 0) {
        if (order.status === "cancelled") {
          return false;
        }
        if (!paymentFilters.has(order.payment_status)) {
          return false;
        }
      }
      return orderMatchesQuery(order, query);
    });
  }, [orders, paymentFilters, query, statusFilters]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const status of ORDER_STATUS_FILTERS) {
      counts[status] = orders.filter((order) => order.status === status).length;
    }
    return counts;
  }, [orders]);

  const paymentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const status of PAYMENT_STATUS_FILTERS) {
      counts[status] = orders.filter(
        (order) =>
          order.status !== "cancelled" && order.payment_status === status,
      ).length;
    }
    return counts;
  }, [orders]);

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
    setSelectedId(orderId);
    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);
    setActionError(null);
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
    setActionError(null);
  }

  function closeOrder() {
    closeOrderLocal();
    if (orderParam) {
      router.push("/commandes");
    }
  }

  function resetFilters() {
    setQuery("");
    setStatusFilters(new Set());
    setPaymentFilters(new Set());
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
        toast.success(successNotice);
      }
      return true;
    } catch (err) {
      const message = displayWhatsAppError(displayOrderError(errorMessage(err)));
      setActionError(message);
      toast.error(message);
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
    toast.success(existingId ? "Livreur modifié." : "Livreur ajouté.");
    if (existingId && detail?.deliverer?.id === existingId) {
      setDetail(await getOrder(token, detail.id));
    }
    return saved;
  }

  if (listError) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader title="Commandes" />
        <p className={`mt-6 ${bannerErrorClass}`} role="alert">
          {listError}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Commandes"
        subtitle={
          <span className="tabular-nums">
            {filtersActive
              ? `${visibleOrders.length} sur ${orders.length} commande${orders.length === 1 ? "" : "s"}`
              : `${orders.length} commande${orders.length === 1 ? "" : "s"}`}
          </span>
        }
        actions={
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => setCreating(true)}
          >
            Nouvelle commande
          </Button>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<ShoppingBag className="size-5" aria-hidden="true" />}
          title="Aucune commande pour le moment"
          description="Les commandes WhatsApp apparaîtront ici."
        />
      ) : (
        <>
          <div className="relative mt-4">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <label htmlFor="order-search" className="sr-only">
              Rechercher une commande
            </label>
            <Input
              id="order-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="N° de commande ou téléphone"
              className="pr-11 pl-9"
            />
            {query ? (
              <IconButton
                label="Effacer la recherche"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-0.5 size-10 -translate-y-1/2"
              >
                <X className="size-4" aria-hidden="true" />
              </IconButton>
            ) : null}
          </div>

          <div className="mt-3 flex flex-col gap-3">
            <FilterChipRow
              label="Statut de la commande"
              values={ORDER_STATUS_FILTERS}
              selected={statusFilters}
              counts={statusCounts}
              onToggle={(value) =>
                setStatusFilters((current) => toggleValue(current, value))
              }
            />
            <FilterChipRow
              label="Paiement"
              values={PAYMENT_STATUS_FILTERS}
              selected={paymentFilters}
              counts={paymentCounts}
              onToggle={(value) =>
                setPaymentFilters((current) => toggleValue(current, value))
              }
            />
            {filtersActive ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                icon={<X className="size-4" />}
                onClick={resetFilters}
              >
                Tout effacer
              </Button>
            ) : null}
          </div>

          {visibleOrders.length === 0 ? (
            <EmptyState
              className="mt-8"
              icon={<ShoppingBag className="size-5" aria-hidden="true" />}
              title="Aucune commande ne correspond à votre recherche"
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          ) : (
            <Card flush className="mt-4 overflow-hidden">
              <ul className="divide-y divide-zinc-100">
                {visibleOrders.map((order) => {
                  const attention = needsAttention(order);
                  return (
                    <li key={order.id}>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/commandes?order=${order.id}`)
                        }
                        className={cn(
                          "flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left",
                          "motion-safe:transition-colors motion-safe:duration-150",
                          focusRingClass,
                          "hover:bg-accent-soft",
                        )}
                      >
                        {attention ? (
                          <span
                            aria-label="Nécessite votre attention"
                            className="size-2 shrink-0 rounded-full bg-warning"
                          />
                        ) : (
                          <span className="size-2 shrink-0" aria-hidden="true" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-nowrap font-bold tabular-nums text-zinc-900">
                            {formatOrderNumber(order.order_number)}
                          </p>
                          <p className="truncate text-sm text-zinc-800 tabular-nums">
                            {order.customer_phone}
                          </p>
                          <p className="truncate text-caption text-zinc-500">
                            {order.city ?? "Pas de ville"} · {order.item_count}{" "}
                            article{order.item_count === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="flex min-w-0 flex-col items-end gap-1">
                          <p className="font-bold tabular-nums text-zinc-900">
                            {formatMoney(order.total)}
                          </p>
                          <StatusBadge status={order.status} />
                          {order.status !== "cancelled" ? (
                            <PaymentStatusBadge status={order.payment_status} />
                          ) : null}
                          <p className="text-caption tabular-nums text-zinc-500">
                            {formatShortDate(order.created_at)}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      {creating ? (
        <CreateOrderDialog
          getToken={getToken}
          pending={actionPending}
          onClose={() => setCreating(false)}
          onCreated={async (orderId, orderNumber) => {
            setCreating(false);
            await refreshList(await getToken());
            toast.success(`${formatOrderNumber(orderNumber)} créée.`);
            router.push(`/commandes?order=${orderId}`);
          }}
        />
      ) : null}

      <Dialog
        open={Boolean(selectedId && detailLoading && !detail)}
        onOpenChange={(open) => {
          if (!open) {
            closeOrder();
          }
        }}
      >
        <DialogContent title="Chargement de la commande">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-5/6" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedId && detailError && !detail)}
        onOpenChange={(open) => {
          if (!open) {
            closeOrder();
          }
        }}
      >
        <DialogContent title="Commande">
          <p className="text-sm text-danger" role="alert">
            {detailError}
          </p>
          <Button className="mt-4" variant="secondary" onClick={closeOrder}>
            Fermer
          </Button>
        </DialogContent>
      </Dialog>

      {detail ? (
        <OrderDetailPanel
          key={detail.id}
          order={detail}
          deliverers={deliverers}
          paymentLinks={paymentLinks}
          paymentLinksError={paymentLinksError}
          paymentLinksLoading={paymentLinksLoading}
          pending={actionPending}
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
