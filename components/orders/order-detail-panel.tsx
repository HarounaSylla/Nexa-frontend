"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import {
  assignDeliverer,
  cancelOrder,
  confirmDelivery,
  createDeliverer,
  type Deliverer,
  type OrderDetail,
  setPaymentLink,
} from "@/lib/orders-api";

import {
  bannerErrorClass,
  bannerSuccessClass,
  btnDanger,
  btnDangerGhost,
  btnPrimary,
  btnSecondary,
  cardClass,
  inputClass,
} from "@/lib/ui";

import { PaymentStatusBadge, StatusBadge } from "./badges";
import {
  canAssignDeliverer,
  canCancelOrder,
  canConfirmDelivery,
  canSendPaymentLink,
  formatDate,
  formatEnum,
  formatMoney,
  formatOrderNumber,
} from "./order-helpers";

const NEW_DELIVERER = "__new__";

export function OrderDetailPanel({
  order,
  deliverers,
  pending,
  notice,
  error,
  onClose,
  runAction,
}: {
  order: OrderDetail;
  deliverers: Deliverer[];
  pending: boolean;
  notice: string | null;
  error: string | null;
  onClose: () => void;
  runAction: (
    action: (token: string | null) => Promise<void>,
    notice?: string,
  ) => Promise<boolean>;
}) {
  const titleId = useId();
  const linkId = useId();
  const delivererId = useId();
  const nameId = useId();
  const phoneId = useId();
  const [paymentLink, setPaymentLinkValue] = useState("");
  const [delivererChoice, setDelivererChoice] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        if (confirmCancel) {
          setConfirmCancel(false);
        } else {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmCancel, onClose, pending]);

  const showPaymentLink = canSendPaymentLink(order);
  const showAssign = canAssignDeliverer(order);
  const showConfirm = canConfirmDelivery(order);
  const showCancel = canCancelOrder(order);
  const addingDeliverer = delivererChoice === NEW_DELIVERER;

  async function submitPaymentLink(event: FormEvent) {
    event.preventDefault();
    const url = paymentLink.trim();
    if (!url) {
      return;
    }
    const ok = await runAction(async (token) => {
      await setPaymentLink(token, order.id, url);
    });
    if (ok) {
      setPaymentLinkValue("");
    }
  }

  async function submitAssign(event: FormEvent) {
    event.preventDefault();
    const ok = await runAction(async (token) => {
      let nextId = delivererChoice;
      if (addingDeliverer) {
        const created = await createDeliverer(token, {
          name: newName.trim(),
          phone: newPhone.trim(),
        });
        nextId = created.id;
      }
      if (!nextId) {
        throw new Error("Choisissez un livreur ou ajoutez-en un nouveau.");
      }
      await assignDeliverer(token, order.id, nextId);
    });
    if (ok) {
      setDelivererChoice("");
      setNewName("");
      setNewPhone("");
    }
  }

  async function submitConfirm() {
    await runAction(async (token) => {
      await confirmDelivery(token, order.id);
    });
  }

  async function submitCancel() {
    const ok = await runAction(async (token) => {
      await cancelOrder(token, order.id);
    }, "Commande annulée. Le stock a été restitué.");
    if (ok) {
      setConfirmCancel(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cardClass} max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-lg font-bold tabular-nums">
              {formatOrderNumber(order.order_number)}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {order.customer_phone} · {formatDate(order.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Fermer
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Ville</dt>
            <dd className="font-medium">{order.city ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Mode de paiement</dt>
            <dd className="font-medium">{formatEnum(order.payment_method)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">Lien de paiement</dt>
            <dd className="font-medium break-all">
              {order.payment_link ? (
                <a
                  href={order.payment_link}
                  className="text-info underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {order.payment_link}
                </a>
              ) : (
                "Aucun"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">Livreur</dt>
            <dd className="font-medium">
              {order.deliverer
                ? `${order.deliverer.name} · ${order.deliverer.phone}`
                : "Non assigné"}
            </dd>
          </div>
        </dl>

        <h3 className="mt-5 text-sm font-semibold">Articles</h3>
        <ul className="mt-2 divide-y divide-zinc-100 rounded-control border border-zinc-200">
          {order.items.map((item, index) => (
            <li
              key={`${item.product_id}-${index}`}
              className="flex items-start justify-between gap-3 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-zinc-500 tabular-nums">
                  {item.quantity} × {formatMoney(item.unit_price)}
                </p>
              </div>
              <p className="font-medium tabular-nums">
                {formatMoney(Number(item.unit_price) * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-right text-sm font-semibold tabular-nums">
          Total {formatMoney(order.total)}
        </p>

        {notice ? (
          <p className={`mt-4 ${bannerSuccessClass}`} role="status">
            {notice}
          </p>
        ) : null}

        {error ? (
          <p className={`mt-4 ${bannerErrorClass}`} role="alert">
            {error}
          </p>
        ) : null}

        {showPaymentLink ? (
          <form className="mt-5 flex flex-col gap-2" onSubmit={submitPaymentLink}>
            <label htmlFor={linkId} className="text-sm font-medium">
              Lien de paiement
            </label>
            <input
              id={linkId}
              type="url"
              required
              value={paymentLink}
              onChange={(event) => setPaymentLinkValue(event.target.value)}
              placeholder="https://"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={pending}
              className={btnPrimary}
            >
              {pending ? "Enregistrement…" : "Envoyer le lien de paiement"}
            </button>
          </form>
        ) : null}

        {showAssign ? (
          <form className="mt-5 flex flex-col gap-2" onSubmit={submitAssign}>
            <label htmlFor={delivererId} className="text-sm font-medium">
              Assigner un livreur
            </label>
            <select
              id={delivererId}
              required
              value={delivererChoice}
              onChange={(event) => setDelivererChoice(event.target.value)}
              className={inputClass}
            >
              <option value="">Choisir un livreur</option>
              {deliverers.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} · {person.phone}
                </option>
              ))}
              <option value={NEW_DELIVERER}>Ajouter un nouveau livreur</option>
            </select>
            {addingDeliverer ? (
              <>
                <label htmlFor={nameId} className="text-sm font-medium">
                  Nom du livreur
                </label>
                <input
                  id={nameId}
                  required
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  className={inputClass}
                />
                <label htmlFor={phoneId} className="text-sm font-medium">
                  Téléphone du livreur
                </label>
                <input
                  id={phoneId}
                  required
                  value={newPhone}
                  onChange={(event) => setNewPhone(event.target.value)}
                  className={inputClass}
                />
              </>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className={btnPrimary}
            >
              {pending ? "Enregistrement…" : "Assigner un livreur"}
            </button>
          </form>
        ) : null}

        {showConfirm ? (
          <button
            type="button"
            disabled={pending}
            onClick={submitConfirm}
            className={`${btnPrimary} mt-5 w-full`}
          >
            {pending ? "Enregistrement…" : "Confirmer la livraison"}
          </button>
        ) : null}

        {showCancel ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmCancel(true)}
            className={`${btnDangerGhost} mt-3 h-11 w-full`}
          >
            Annuler la commande
          </button>
        ) : null}

        {confirmCancel ? (
          <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-order-title"
              className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-md sm:rounded-card`}
            >
              <h3 id="cancel-order-title" className="font-display text-lg font-bold">
                Annuler cette commande ?
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                Le stock de ces articles sera restitué. Cette action est
                irréversible.
              </p>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmCancel(false)}
                  className={btnSecondary}
                >
                  Garder la commande
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={submitCancel}
                  className={btnDanger}
                >
                  {pending ? "Annulation…" : "Annuler la commande"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
