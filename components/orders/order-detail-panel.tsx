"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/field";
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
import { bannerErrorClass, bannerInfoClass } from "@/lib/ui";

import { DelivererFormDialog } from "./deliverer-form-dialog";
import { OrderActions } from "./order-actions";
import { OrderHeader } from "./order-header";
import { OrderItemsList } from "./order-items-list";
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
} from "./order-helpers";

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
  const [chosenLinkId, setChosenLinkId] = useState<string | null>(null);
  const [delivererChoice, setDelivererChoice] = useState("");
  const [delivererDialog, setDelivererDialog] = useState<
    { mode: "add" } | { mode: "edit"; deliverer: Deliverer } | null
  >(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmPaid, setConfirmPaid] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const nestedOpenRef = useRef(false);

  useEffect(() => {
    nestedOpenRef.current = Boolean(
      delivererDialog || confirmCancel || confirmPaid || confirmReject,
    );
  }, [confirmCancel, confirmPaid, confirmReject, delivererDialog]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || pending || nestedOpenRef.current) {
        return;
      }
      onClose();
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose, pending]);

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
    }, "Livreur assigné.");
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
    }, "Livraison confirmée.");
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
    <div className="fixed inset-0 z-dialog flex items-stretch justify-center bg-transparent sm:items-center sm:bg-black/40 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-dvh w-full flex-col overflow-hidden bg-white sm:h-[85dvh] sm:max-w-2xl sm:rounded-card sm:border sm:border-zinc-200/80 sm:shadow-card"
      >
        <OrderHeader order={order} titleId={titleId} onClose={onClose} />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
          {showProofBlock ? (
            <div>
              <p className={bannerInfoClass} role="status">
                Une preuve de paiement a été reçue. Vérifiez le paiement dans
                votre application avant de confirmer.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                {showMarkPaid ? (
                  <Button
                    type="button"
                    disabled={pending}
                    className="w-full sm:flex-1"
                    onClick={() => setConfirmPaid(true)}
                  >
                    Marquer comme payée
                  </Button>
                ) : null}
                {showRejectProof ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pending}
                    className="w-full sm:flex-1"
                    onClick={() => setConfirmReject(true)}
                  >
                    Preuve non valide
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {error ? (
            <p
              className={`mt-4 ${bannerErrorClass}`}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <section className={showProofBlock || error ? "mt-5 border-t border-zinc-100 pt-5" : ""}>
            <h3 className="text-section-title text-sm">Détails</h3>
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

          <OrderItemsList items={order.items} total={order.total} />

          {showPaymentLink ? (
            <section className="border-t border-zinc-100 pt-5">
              <h3 className="text-section-title text-sm">Paiement</h3>
              {paymentLinksError ? (
                <div className="mt-3">
                  <p className={bannerErrorClass} role="alert">
                    {paymentLinksError}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3"
                    disabled={paymentLinksLoading}
                    onClick={onRetryPaymentLinks}
                  >
                    {paymentLinksLoading ? "Chargement…" : "Réessayer"}
                  </Button>
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
                    <Select
                      id={linkId}
                      value={selectedLinkId}
                      onChange={(event) => setChosenLinkId(event.target.value)}
                      className="min-w-0 flex-1"
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
                    </Select>
                    <div className="flex flex-col gap-1 sm:shrink-0">
                      <Button
                        type="submit"
                        disabled={pending || !selectedLinkId}
                      >
                        {pending
                          ? "Envoi…"
                          : order.payment_link_sent_at
                            ? "Renvoyer le lien"
                            : "Envoyer le lien"}
                      </Button>
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
            </section>
          ) : null}

          {showDeliverySection ? (
            <section className="border-t border-zinc-100 pt-5">
              <h3 className="text-section-title text-sm">Livraison</h3>
              {assignedDeliverer ? (
                <div className="mt-3 flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm">
                    Livreur : {assignedDeliverer.name} · {assignedDeliverer.phone}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    aria-label={`Modifier ${assignedDeliverer.name}`}
                    disabled={pending}
                    onClick={() =>
                      setDelivererDialog({
                        mode: "edit",
                        deliverer: assignedDeliverer,
                      })
                    }
                  >
                    Modifier
                  </Button>
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
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
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
                            >
                              Modifier
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </fieldset>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => setDelivererDialog({ mode: "add" })}
                  >
                    Ajouter un livreur
                  </Button>
                  <Button type="submit" disabled={pending || !chosenDeliverer}>
                    {pending ? "Enregistrement…" : "Assigner un livreur"}
                  </Button>
                </form>
              ) : null}
            </section>
          ) : null}

          <OrderActions
            showMarkPaid={showMarkPaidInPayment}
            showConfirm={showConfirm}
            showCancel={showCancel}
            pending={pending}
            onMarkPaid={() => setConfirmPaid(true)}
            onConfirm={() => void submitConfirm()}
            onCancel={() => setConfirmCancel(true)}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmPaid}
        title="Confirmer le paiement ?"
        description={
          order.payment_status === "proof_received"
            ? `Vérifiez que le paiement de ${formatMoney(order.total)} pour la commande #${order.order_number} est bien arrivé dans votre application. Cette action ne peut pas être annulée.`
            : `Vous confirmez avoir reçu le paiement de ${formatMoney(order.total)} pour la commande #${order.order_number}. Cette action ne peut pas être annulée.`
        }
        cancelLabel="Pas encore"
        confirmLabel="Oui, paiement reçu"
        pending={pending}
        onCancel={() => setConfirmPaid(false)}
        onConfirm={() => void submitMarkPaid()}
      />

      <ConfirmDialog
        open={confirmReject}
        title="Le paiement n'est pas arrivé ?"
        description="La commande repassera en « Paiement en attente ». Les photos reçues sont conservées. Le client n'est pas prévenu : écrivez-lui depuis la page Conversations."
        cancelLabel="Annuler"
        confirmLabel="Oui, preuve non valide"
        pending={pending}
        onCancel={() => setConfirmReject(false)}
        onConfirm={() => void submitRejectProof()}
      />

      <ConfirmDialog
        open={confirmCancel}
        title="Annuler cette commande ?"
        description="Le stock de ces articles sera restitué. Cette action est irréversible."
        cancelLabel="Garder la commande"
        confirmLabel="Annuler la commande"
        confirmPendingLabel="Annulation…"
        variant="danger"
        pending={pending}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => void submitCancel()}
      />

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
  );
}
