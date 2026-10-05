"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import Link from "next/link";

import {
  assignDeliverer,
  cancelOrder,
  confirmDelivery,
  type Deliverer,
  markOrderPaid,
  type OrderDetail,
  rejectProof,
  sendPaymentLink,
} from "@/lib/orders-api";
import type { PaymentLink } from "@/lib/payment-links-api";

import {
  bannerErrorClass,
  bannerInfoClass,
  bannerSuccessClass,
  btnDanger,
  btnDangerGhost,
  btnPrimary,
  btnSecondary,
  btnWarningOutline,
  cardClass,
  inputClass,
} from "@/lib/ui";

import { PaymentStatusBadge, StatusBadge } from "./badges";
import { DelivererFormDialog } from "./deliverer-form-dialog";
import {
  canAssignDeliverer,
  canCancelOrder,
  canConfirmDelivery,
  canMarkPaid,
  canRejectProof,
  canSendPaymentLink,
  formatDate,
  formatEnum,
  formatMoney,
  formatOrderNumber,
} from "./order-helpers";

const sectionClass = "mt-5 border-t border-zinc-100 pt-5";
const modifierBtnClass = `${btnSecondary} h-10 min-h-10 shrink-0 px-3`;

function inferredPaymentLinkId(
  order: OrderDetail,
  links: PaymentLink[],
): string {
  const match = links.find((link) => link.url === order.payment_link);
  if (match) {
    return match.id;
  }
  if (links.length === 1) {
    return links[0].id;
  }
  return "";
}

export function OrderDetailPanel({
  order,
  deliverers,
  paymentLinks,
  paymentLinksError,
  paymentLinksLoading,
  pending,
  notice,
  error,
  onClose,
  onRetryPaymentLinks,
  onSaveDeliverer,
  runAction,
}: {
  order: OrderDetail;
  deliverers: Deliverer[];
  paymentLinks: PaymentLink[] | null;
  paymentLinksError: string | null;
  paymentLinksLoading: boolean;
  pending: boolean;
  notice: string | null;
  error: string | null;
  onClose: () => void;
  onRetryPaymentLinks: () => void;
  onSaveDeliverer: (
    input: { name: string; phone: string },
    existingId?: string,
  ) => Promise<Deliverer>;
  runAction: (
    action: (token: string | null) => Promise<void>,
    notice?: string,
    options?: { refreshOnError?: boolean },
  ) => Promise<boolean>;
}) {
  const titleId = useId();
  const linkId = useId();
  const delivererGroupId = useId();
  const paidTitleId = useId();
  const rejectTitleId = useId();
  const [chosenLinkId, setChosenLinkId] = useState<string | null>(null);
  const [delivererChoice, setDelivererChoice] = useState("");
  const [delivererDialog, setDelivererDialog] = useState<
    { mode: "add" } | { mode: "edit"; deliverer: Deliverer } | null
  >(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmPaid, setConfirmPaid] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || pending) {
        return;
      }
      if (delivererDialog) {
        return;
      }
      if (confirmReject) {
        setConfirmReject(false);
      } else if (confirmPaid) {
        setConfirmPaid(false);
      } else if (confirmCancel) {
        setConfirmCancel(false);
      } else {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    confirmCancel,
    confirmPaid,
    confirmReject,
    delivererDialog,
    onClose,
    pending,
  ]);

  const showPaymentLink = canSendPaymentLink(order);
  const showAssign = canAssignDeliverer(order);
  const showConfirm = canConfirmDelivery(order);
  const showMarkPaid = canMarkPaid(order);
  const showRejectProof = canRejectProof(order);
  const showCancel = canCancelOrder(order);
  const showProofBlock = order.payment_status === "proof_received";
  const showMarkPaidInPayment = showMarkPaid && !showProofBlock;
  const showDeliverySection =
    Boolean(order.deliverer) || showAssign || showConfirm;
  const showCodPendingHelp =
    order.payment_method === "cash_on_delivery" &&
    order.payment_status === "pending" &&
    order.status !== "cancelled";
  const assignedDeliverer = order.deliverer;
  const chosenDeliverer = deliverers.some(
    (person) => person.id === delivererChoice,
  );
  const selectedLinkId =
    chosenLinkId ??
    (paymentLinks ? inferredPaymentLinkId(order, paymentLinks) : "");

  async function submitPaymentLink(event: FormEvent) {
    event.preventDefault();
    if (!selectedLinkId) {
      return;
    }
    await runAction(
      async (token) => {
        await sendPaymentLink(token, order.id, selectedLinkId);
      },
      "Lien de paiement envoyé au client sur WhatsApp.",
      { refreshOnError: true },
    );
  }

  async function submitAssign(event: FormEvent) {
    event.preventDefault();
    if (!chosenDeliverer) {
      return;
    }
    const ok = await runAction(async (token) => {
      await assignDeliverer(token, order.id, delivererChoice);
    });
    if (ok) {
      setDelivererChoice("");
    }
  }

  async function saveDeliverer(input: { name: string; phone: string }) {
    const existingId =
      delivererDialog?.mode === "edit" ? delivererDialog.deliverer.id : undefined;
    const saved = await onSaveDeliverer(input, existingId);
    setDelivererDialog(null);
    if (!existingId) {
      setDelivererChoice(saved.id);
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

  async function submitMarkPaid() {
    const ok = await runAction(async (token) => {
      await markOrderPaid(token, order.id);
    }, "Paiement enregistré.");
    if (ok) {
      setConfirmPaid(false);
    }
  }

  async function submitRejectProof() {
    const ok = await runAction(async (token) => {
      await rejectProof(token, order.id);
    }, "Preuve rejetée. La commande repasse en attente de paiement.");
    if (ok) {
      setConfirmReject(false);
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
            <h2
              id={titleId}
              className="font-display text-lg font-bold tabular-nums"
            >
              {formatOrderNumber(order.order_number)}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {order.customer_phone} · {formatDate(order.created_at)}
            </p>
          </div>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Fermer
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          {order.status !== "cancelled" ? (
            <PaymentStatusBadge status={order.payment_status} />
          ) : null}
          {order.conversation_id ? (
            <Link
              href={`/conversations?conversation=${order.conversation_id}`}
              className="inline-flex h-8 items-center rounded-control px-2 text-sm font-medium text-zinc-700 underline underline-offset-2"
            >
              Voir la conversation
            </Link>
          ) : null}
        </div>

        {showProofBlock ? (
          <div className="mt-4">
            <p className={bannerInfoClass} role="status">
              Une preuve de paiement a été reçue. Vérifiez le paiement dans
              votre application avant de confirmer.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {showMarkPaid ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmPaid(true)}
                  className={`${btnPrimary} w-full sm:flex-1`}
                >
                  Marquer comme payée
                </button>
              ) : null}
              {showRejectProof ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmReject(true)}
                  className={`${btnWarningOutline} w-full sm:flex-1`}
                >
                  Preuve non valide
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

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

        <section className={sectionClass}>
          <h3 className="text-sm font-semibold">Détails</h3>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Ville</dt>
              <dd className="font-medium">{order.city ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Mode de paiement</dt>
              <dd className="font-medium">{formatEnum(order.payment_method)}</dd>
              {showCodPendingHelp ? (
                <p className="mt-1 text-sm text-zinc-500">
                  Le paiement sera marqué comme reçu à la confirmation de la
                  livraison.
                </p>
              ) : null}
            </div>
          </dl>
        </section>

        <section className={sectionClass}>
          <h3 className="text-sm font-semibold">Articles</h3>
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
        </section>

        {showPaymentLink ? (
          <section className={sectionClass}>
            <h3 className="text-sm font-semibold">Paiement</h3>
            {paymentLinksError ? (
              <div className="mt-3">
                <p className={bannerErrorClass} role="alert">
                  {paymentLinksError}
                </p>
                <button
                  type="button"
                  disabled={paymentLinksLoading}
                  onClick={onRetryPaymentLinks}
                  className={`${btnSecondary} mt-3`}
                >
                  {paymentLinksLoading ? "Chargement…" : "Réessayer"}
                </button>
              </div>
            ) : paymentLinksLoading && paymentLinks === null ? (
              <p className="mt-3 text-sm text-zinc-500">Chargement…</p>
            ) : paymentLinks && paymentLinks.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Aucun lien de paiement enregistré.{" "}
                <Link href="/parametres" className="underline underline-offset-2">
                  Ajouter un lien dans les paramètres
                </Link>
              </p>
            ) : paymentLinks ? (
              <form className="mt-3 flex flex-col gap-2" onSubmit={submitPaymentLink}>
                <label htmlFor={linkId} className="text-sm font-medium">
                  Lien de paiement à envoyer
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <select
                    id={linkId}
                    value={selectedLinkId}
                    onChange={(event) => setChosenLinkId(event.target.value)}
                    className={`${inputClass} min-w-0 flex-1`}
                  >
                    {selectedLinkId === "" ? (
                      <option value="" disabled>
                        Choisir un lien
                      </option>
                    ) : null}
                    {paymentLinks.map((link) => (
                      <option key={link.id} value={link.id}>
                        {link.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-col gap-1 sm:shrink-0">
                    <button
                      type="submit"
                      disabled={pending || !selectedLinkId}
                      className={btnPrimary}
                    >
                      {pending
                        ? "Envoi…"
                        : order.payment_link_sent_at
                          ? "Renvoyer le lien"
                          : "Envoyer le lien"}
                    </button>
                    {order.payment_link_sent_at ? (
                      <p className="text-sm text-zinc-500">
                        {order.payment_link_label
                          ? `Lien ${order.payment_link_label} envoyé le ${formatDate(order.payment_link_sent_at)}.`
                          : `Lien envoyé le ${formatDate(order.payment_link_sent_at)}.`}
                      </p>
                    ) : order.payment_link ? (
                      <p className="text-sm text-warning">
                        Pas encore envoyé au client.
                      </p>
                    ) : null}
                  </div>
                </div>
              </form>
            ) : null}

            {showMarkPaidInPayment ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmPaid(true)}
                className={`${btnPrimary} mt-4 w-full`}
              >
                Marquer comme payée
              </button>
            ) : null}
          </section>
        ) : null}

        {showDeliverySection ? (
          <section className={sectionClass}>
            <h3 className="text-sm font-semibold">Livraison</h3>
            {assignedDeliverer ? (
              <div className="mt-3 flex items-start gap-2">
                <p className="min-w-0 flex-1 text-sm">
                  Livreur : {assignedDeliverer.name} · {assignedDeliverer.phone}
                </p>
                <button
                  type="button"
                  aria-label={`Modifier ${assignedDeliverer.name}`}
                  disabled={pending}
                  onClick={() =>
                    setDelivererDialog({
                      mode: "edit",
                      deliverer: assignedDeliverer,
                    })
                  }
                  className={modifierBtnClass}
                >
                  Modifier
                </button>
              </div>
            ) : showAssign ? (
              <form className="mt-3 flex flex-col gap-3" onSubmit={submitAssign}>
                <fieldset className="min-w-0">
                  <legend className="text-sm font-medium">
                    Assigner un livreur
                  </legend>
                  {deliverers.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-500">
                      Aucun livreur enregistré.
                    </p>
                  ) : (
                    <ul className="mt-2 max-h-56 overflow-y-auto">
                      {deliverers.map((person) => (
                        <li
                          key={person.id}
                          className="flex items-center gap-2 py-1"
                        >
                          <label className="flex min-w-0 flex-1 items-start gap-2 text-sm">
                            <input
                              type="radio"
                              name={delivererGroupId}
                              value={person.id}
                              checked={delivererChoice === person.id}
                              onChange={() => setDelivererChoice(person.id)}
                              className="mt-1 size-4 shrink-0 accent-accent"
                            />
                            <span className="min-w-0">
                              <span className="font-bold">{person.name}</span>
                              <span className="text-zinc-500">
                                {" "}
                                · {person.phone}
                              </span>
                            </span>
                          </label>
                          <button
                            type="button"
                            aria-label={`Modifier ${person.name}`}
                            disabled={pending}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setDelivererDialog({
                                mode: "edit",
                                deliverer: person,
                              });
                            }}
                            className={modifierBtnClass}
                          >
                            Modifier
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </fieldset>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setDelivererDialog({ mode: "add" })}
                  className={btnSecondary}
                >
                  Ajouter un livreur
                </button>
                <button
                  type="submit"
                  disabled={pending || !chosenDeliverer}
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
                className={`${btnPrimary} mt-4 w-full`}
              >
                {pending ? "Enregistrement…" : "Confirmer la livraison"}
              </button>
            ) : null}
          </section>
        ) : null}

        {showCancel ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmCancel(true)}
            className={`${btnDangerGhost} mt-5 h-11 w-full`}
          >
            Annuler la commande
          </button>
        ) : null}

        {confirmPaid ? (
          <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={paidTitleId}
              className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-md sm:rounded-card`}
            >
              <h3 id={paidTitleId} className="font-display text-lg font-bold">
                Confirmer le paiement ?
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                {order.payment_status === "proof_received"
                  ? `Vérifiez que le paiement de ${formatMoney(order.total)} pour la commande #${order.order_number} est bien arrivé dans votre application. Cette action ne peut pas être annulée.`
                  : `Vous confirmez avoir reçu le paiement de ${formatMoney(order.total)} pour la commande #${order.order_number}. Cette action ne peut pas être annulée.`}
              </p>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmPaid(false)}
                  className={btnSecondary}
                >
                  Pas encore
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={submitMarkPaid}
                  className={btnPrimary}
                >
                  {pending ? "Enregistrement…" : "Oui, paiement reçu"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {confirmReject ? (
          <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={rejectTitleId}
              className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-md sm:rounded-card`}
            >
              <h3 id={rejectTitleId} className="font-display text-lg font-bold">
                Le paiement n&apos;est pas arrivé ?
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                La commande repassera en « Paiement en attente ». Les photos
                reçues sont conservées. Le client n&apos;est pas prévenu :
                écrivez-lui depuis la page Conversations.
              </p>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmReject(false)}
                  className={btnSecondary}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={submitRejectProof}
                  className={btnPrimary}
                >
                  {pending ? "Enregistrement…" : "Oui, preuve non valide"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {confirmCancel ? (
          <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-order-title"
              className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-md sm:rounded-card`}
            >
              <h3
                id="cancel-order-title"
                className="font-display text-lg font-bold"
              >
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

        {delivererDialog ? (
          <DelivererFormDialog
            mode={delivererDialog.mode}
            deliverer={
              delivererDialog.mode === "edit"
                ? delivererDialog.deliverer
                : undefined
            }
            onClose={() => setDelivererDialog(null)}
            onSubmit={saveDeliverer}
          />
        ) : null}
      </div>
    </div>
  );
}
