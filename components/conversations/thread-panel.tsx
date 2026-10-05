"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import type {
  ConversationListItem,
  ConversationMessage,
  MessageImage,
} from "@/lib/conversations-api";
import {
  AuthenticatedImage,
  ImagePreviewDialog,
} from "@/components/shared/authenticated-image";
import { PaymentStatusBadge } from "@/components/orders/badges";
import { formatEnum, formatMoney } from "@/components/orders/order-helpers";
import { btnPrimary, btnSecondary, cardClass, inputClass } from "@/lib/ui";

import {
  escalationReason,
  formatDate,
  isClosed,
  isEscalated,
  isEscalationNote,
  roleLabel,
} from "./helpers";
import { ConversationStatusBadge } from "./status-badge";

export function ThreadPanel({
  conversation,
  messages,
  pending,
  error,
  onClose,
  onReply,
  onReturnToAgent,
}: {
  conversation: ConversationListItem;
  messages: ConversationMessage[];
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onReply: (text: string) => Promise<boolean>;
  onReturnToAgent: () => Promise<void>;
}) {
  const titleId = useId();
  const replyId = useId();
  const [draft, setDraft] = useState("");
  const [previewImageId, setPreviewImageId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const linkedOrders = conversation.orders ?? [];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        if (previewImageId) {
          setPreviewImageId(null);
        } else {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending, previewImageId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [messages.length]);

  async function submitReply(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }
    const ok = await onReply(text);
    if (ok) {
      setDraft("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cardClass} flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl sm:max-w-lg sm:rounded-card`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 p-5">
          <div>
            <h2 id={titleId} className="font-display text-lg font-bold">
              {conversation.customer_phone}
            </h2>
            <div className="mt-2">
              <ConversationStatusBadge status={conversation.status} />
              {isClosed(conversation.status) ? (
                <p className="mt-1 text-xs text-zinc-500">
                  Conversation fermée — si le client écrit à nouveau, un nouveau fil sera
                  créé automatiquement.
                </p>
              ) : null}
              {linkedOrders.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs text-zinc-500">Commandes liées :</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {linkedOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/commandes?order=${order.id}`}
                        className="inline-flex flex-wrap items-center gap-1.5 rounded-control border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800"
                      >
                        #{order.order_number} · {formatEnum(order.status)}
                        {order.status !== "cancelled" ? (
                          <PaymentStatusBadge status={order.payment_status} />
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Fermer
          </button>
        </div>

        <ul
          ref={scrollerRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
        >
          {messages.map((message) => {
            if (isEscalationNote(message)) {
              return (
                <li key={message.id} className="px-4 py-1 text-center">
                  <p className="text-xs font-medium text-warning">
                    Escaladé : {escalationReason(message.display_text)}
                  </p>
                </li>
              );
            }
            const role = message.turn_role;
            const align =
              role === "customer"
                ? "items-start"
                : role === "merchant"
                  ? "items-end"
                  : "items-start";
            const bubble =
              role === "customer"
                ? "bg-accent-soft text-accent-text"
                : role === "merchant"
                  ? "bg-accent text-white"
                  : "bg-info-soft text-info";
            return (
              <li key={message.id} className={`flex flex-col ${align}`}>
                <p className="mb-1 text-xs text-zinc-500">
                  {roleLabel(role)} · {formatDate(message.created_at)}
                </p>
                <div
                  className={`max-w-[85%] rounded-control px-3 py-2 text-sm ${bubble}`}
                >
                  {message.image ? (
                    <div className="flex flex-col gap-2">
                      <AuthenticatedImage
                        imageId={message.image.id}
                        alt={message.display_text || "Photo"}
                        className="max-h-60 min-h-24 max-w-[240px] rounded-control bg-zinc-100 object-contain"
                        onClick={() => setPreviewImageId(message.image!.id)}
                      />
                      <p>{message.display_text || "Photo"}</p>
                      <ImageTag
                        image={message.image}
                        orders={linkedOrders}
                      />
                    </div>
                  ) : (
                    message.display_text
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {error ? (
          <p className="px-5 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <form
          className="flex flex-col gap-2 border-t border-zinc-100 p-5"
          onSubmit={submitReply}
        >
          {isEscalated(conversation.status) ? (
            <button
              type="button"
              disabled={pending}
              onClick={onReturnToAgent}
              className={btnSecondary}
            >
              Renvoyer à l&apos;agent
            </button>
          ) : null}
          <label htmlFor={replyId} className="sr-only">
            Réponse
          </label>
          <textarea
            id={replyId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Écrivez votre réponse…"
            rows={3}
            className={`${inputClass} h-auto py-2`}
          />
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? "Envoi…" : "Envoyer"}
          </button>
        </form>
      </div>
      {previewImageId ? (
        <ImagePreviewDialog
          imageId={previewImageId}
          onClose={() => setPreviewImageId(null)}
        />
      ) : null}
    </div>
  );
}

function ImageTag({
  image,
  orders,
}: {
  image: MessageImage;
  orders: ConversationListItem["orders"];
}) {
  const amount =
    image.detected_amount != null && image.detected_amount !== "" ? (
      <span> Montant lu : {formatMoney(image.detected_amount)} (à vérifier)</span>
    ) : null;

  if (image.classification === "payment_proof" && image.order_id) {
    const matched = orders.find((order) => order.id === image.order_id);
    if (matched) {
      return (
        <p className="text-xs">
          <Link
            href={`/commandes?order=${matched.id}`}
            className="underline"
          >
            Preuve de paiement probable · commande #{matched.order_number}
          </Link>
          {amount}
        </p>
      );
    }
    return (
      <p className="text-xs text-warning">
        Preuve de paiement probable · commande à identifier. Ouvrez la
        commande concernée pour vérifier.
        {amount}
      </p>
    );
  }

  if (image.classification === "payment_proof") {
    return (
      <p className="text-xs text-warning">
        Preuve de paiement probable · commande à identifier. Ouvrez la
        commande concernée pour vérifier.
        {amount}
      </p>
    );
  }

  if (image.classification === "unknown") {
    return (
      <p className="text-xs">
        Image non analysée
        {amount}
      </p>
    );
  }

  return null;
}
