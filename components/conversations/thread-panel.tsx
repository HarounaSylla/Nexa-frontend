"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import type {
  ConversationListItem,
  ConversationMessage,
} from "@/lib/conversations-api";
import { btnPrimary, btnSecondary, cardClass, inputClass } from "@/lib/ui";

import {
  escalationReason,
  formatDate,
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
  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending]);

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
                <p
                  className={`max-w-[85%] rounded-control px-3 py-2 text-sm ${bubble}`}
                >
                  {message.display_text}
                </p>
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
    </div>
  );
}
