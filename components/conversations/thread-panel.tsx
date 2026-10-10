"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import type {
  ConversationListItem,
  ConversationMessage,
  MessageImage,
  QuotedMessage,
  QuotedMessageKind,
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
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [liveTick, setLiveTick] = useState(0);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(
    null,
  );
  const scrollerRef = useRef<HTMLUListElement>(null);
  const nearBottomRef = useRef(true);
  const prevMessagesRef = useRef<ConversationMessage[] | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const linkedOrders = conversation.orders ?? [];
  const loadedMessageIds = new Set(messages.map((message) => message.id));

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

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
    const scroller = scrollerRef.current;
    const previous = prevMessagesRef.current;
    prevMessagesRef.current = messages;

    if (!scroller) {
      return;
    }
    if (previous === null) {
      scroller.scrollTo({ top: scroller.scrollHeight });
      nearBottomRef.current = true;
      return;
    }

    const knownIds = new Set(previous.map((message) => message.id));
    const added = messages.filter((message) => !knownIds.has(message.id));
    if (added.length === 0) {
      return;
    }

    const ownReply = added.some((message) => message.turn_role === "merchant");
    const customerMessage = added.some(
      (message) => message.turn_role === "customer",
    );
    if (nearBottomRef.current || ownReply) {
      scroller.scrollTo({ top: scroller.scrollHeight });
      nearBottomRef.current = true;
      setShowNewMessages(false);
    } else {
      setShowNewMessages(true);
    }
    if (customerMessage) {
      setLiveTick((tick) => tick + 1);
    }
  }, [messages]);

  function onThreadScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const nearBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= 80;
    nearBottomRef.current = nearBottom;
    if (nearBottom) {
      setShowNewMessages(false);
    }
  }

  function scrollToLatest() {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scroller.scrollTo({ top: scroller.scrollHeight });
    nearBottomRef.current = true;
    setShowNewMessages(false);
  }

  function scrollToQuotedMessage(messageId: string) {
    const target = document.getElementById(threadMessageDomId(messageId));
    if (!target) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }
    setHighlightedMessageId(messageId);
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedMessageId((current) =>
        current === messageId ? null : current,
      );
      highlightTimerRef.current = null;
    }, 1600);
  }

  async function sendDraft() {
    const text = draft.trim();
    if (!text || pending) {
      return;
    }
    const ok = await onReply(text);
    if (ok) {
      setDraft("");
    }
  }

  function submitReply(event: FormEvent) {
    event.preventDefault();
    void sendDraft();
  }

  function onDraftKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") {
      return;
    }
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    if (event.shiftKey) {
      return;
    }
    event.preventDefault();
    void sendDraft();
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

        <div className="relative flex min-h-0 flex-1 flex-col">
          <ul
            ref={scrollerRef}
            onScroll={onThreadScroll}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
          >
          {messages.map((message) => {
            if (isEscalationNote(message)) {
              return (
                <li
                  id={threadMessageDomId(message.id)}
                  key={message.id}
                  className="px-4 py-1 text-center"
                >
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
            const quoted =
              role === "customer" ? quotedForDisplay(message.quoted) : null;
            const quotedTargetId = quoted?.message_id ?? null;
            const canJumpToQuoted =
              quotedTargetId !== null && loadedMessageIds.has(quotedTargetId);
            return (
              <li
                id={threadMessageDomId(message.id)}
                key={message.id}
                className={`flex flex-col ${align}`}
              >
                <p className="mb-1 text-xs text-zinc-500">
                  {roleLabel(role)} · {formatDate(message.created_at)}
                </p>
                <div
                  className={`max-w-[85%] rounded-control px-3 py-2 text-sm ${quoted ? "min-w-0" : ""} ${bubble} ${
                    highlightedMessageId === message.id
                      ? "ring-2 ring-warning ring-offset-2 ring-offset-white"
                      : ""
                  } motion-safe:transition-shadow motion-safe:duration-500`}
                >
                  {quoted ? (
                    <QuotedReplyBlock
                      quoted={quoted}
                      canJump={canJumpToQuoted}
                      onJump={() => {
                        if (quotedTargetId) {
                          scrollToQuotedMessage(quotedTargetId);
                        }
                      }}
                    />
                  ) : null}
                  {message.image ? (
                    <div className="flex flex-col gap-2">
                      <AuthenticatedImage
                        imageId={message.image.id}
                        alt={message.display_text || "Photo"}
                        className="max-h-60 min-h-24 max-w-[240px] rounded-control bg-zinc-100 object-contain"
                        deleted={Boolean(message.image.deleted)}
                        onClick={
                          message.image.deleted
                            ? undefined
                            : () => setPreviewImageId(message.image!.id)
                        }
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
          {showNewMessages ? (
            <button
              type="button"
              aria-label="Nouveaux messages"
              onClick={scrollToLatest}
              className={`${btnSecondary} absolute bottom-3 left-1/2 z-10 h-10 -translate-x-1/2 shadow-card`}
            >
              Nouveaux messages
            </button>
          ) : null}
          <div key={liveTick} className="sr-only" aria-live="polite">
            {liveTick > 0 ? "Nouveau message du client." : ""}
          </div>
        </div>

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
            onKeyDown={onDraftKeyDown}
            placeholder="Écrivez votre réponse…"
            rows={3}
            className={`${inputClass} h-auto py-2`}
          />
          <p className="hidden text-sm text-zinc-500 pointer-fine:block">
            Entrée pour envoyer · Maj+Entrée pour un saut de ligne
          </p>
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

function threadMessageDomId(messageId: string): string {
  return `thread-msg-${messageId}`;
}

const QUOTED_KINDS = new Set<QuotedMessageKind>([
  "shop_text",
  "shop_photo",
  "customer_text",
  "customer_photo",
]);

function quotedForDisplay(
  quoted: ConversationMessage["quoted"],
): QuotedMessage | null {
  if (!quoted || typeof quoted !== "object") {
    return null;
  }
  if (!QUOTED_KINDS.has(quoted.kind)) {
    return null;
  }
  return {
    kind: quoted.kind,
    excerpt: quoted.excerpt ?? null,
    product_name: quoted.product_name ?? null,
    from_earlier_conversation: Boolean(quoted.from_earlier_conversation),
    message_id: quoted.message_id ?? null,
  };
}

function quotedTargetLabel(kind: QuotedMessageKind): string {
  if (kind === "shop_text") {
    return "la boutique";
  }
  if (kind === "shop_photo") {
    return "la photo de la boutique";
  }
  if (kind === "customer_text") {
    return "son propre message";
  }
  return "sa propre photo";
}

function quotedBodyText(quoted: QuotedMessage): string | null {
  const isPhoto =
    quoted.kind === "shop_photo" || quoted.kind === "customer_photo";
  if (isPhoto) {
    const productName = quoted.product_name?.trim();
    return productName ? `Photo : ${productName}` : "Photo";
  }
  const excerpt = quoted.excerpt?.trim();
  return excerpt || null;
}

function QuotedReplyBlock({
  quoted,
  canJump,
  onJump,
}: {
  quoted: QuotedMessage;
  canJump: boolean;
  onJump: () => void;
}) {
  const target = quotedTargetLabel(quoted.kind);
  const heading = `En réponse à ${target}`;
  const body = quotedBodyText(quoted);
  const content = (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <p className="min-w-0 text-[11px] font-medium text-zinc-600">{heading}</p>
        {quoted.from_earlier_conversation ? (
          <span className="shrink-0 rounded-full bg-zinc-200/90 px-1.5 py-px text-[10px] font-medium text-zinc-600">
            conversation précédente
          </span>
        ) : null}
      </div>
      {body ? (
        <p className="mt-0.5 line-clamp-2 min-w-0 wrap-break-word text-xs text-zinc-700">
          {body}
        </p>
      ) : null}
    </>
  );

  const blockClass =
    "mb-2 w-full min-w-0 overflow-hidden rounded-md border-l-[3px] border-accent bg-white/75 px-2 py-1.5 text-left";

  if (canJump) {
    return (
      <button
        type="button"
        onClick={onJump}
        aria-label={`Aller au message cité — ${heading}`}
        className={`${blockClass} cursor-pointer hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      >
        {content}
      </button>
    );
  }

  return <div className={blockClass}>{content}</div>;
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

  if (image.classification === "product_photo") {
    const name = (image.matched_product_name ?? "").trim();
    if (image.match_kind === "exact" && name) {
      return <p className="text-xs">Produit reconnu : {name}</p>;
    }
    if (image.match_kind === "similar" && name) {
      return (
        <p className="text-xs">
          Produit proche : {name} (pas exactement le même modèle)
        </p>
      );
    }
    return (
      <p className="text-xs text-warning">Photo de produit non reconnue</p>
    );
  }

  return null;
}
