"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo, useRef, useState } from "react";

import { errorMessage } from "@/lib/api";
import {
  type ConversationListItem,
  type ConversationMessage,
  listConversationMessages,
  listConversations,
  replyToConversation,
  returnConversationToAgent,
} from "@/lib/conversations-api";
import {
  btnSecondary,
  cardClass,
  cardInteractiveClass,
  emptyStateClass,
  inputClass,
  pageTitleClass,
} from "@/lib/ui";

import {
  conversationStatusLabel,
  formatDate,
  isClosed,
  isEscalated,
  normalizePhone,
} from "./helpers";
import { ConversationStatusBadge } from "./status-badge";
import { ThreadPanel } from "./thread-panel";

const STATUS_FILTERS = ["all", "active", "escalated", "closed"] as const;

export function ConversationsView({
  initialConversations,
  initialError = null,
}: {
  initialConversations: ConversationListItem[];
  initialError?: string | null;
}) {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState(initialConversations);
  const [listError, setListError] = useState<string | null>(initialError);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const openRequest = useRef(0);

  const selected = conversations.find((row) => row.id === selectedId) ?? null;
  const filtersActive = query.trim() !== "" || statusFilter !== "all";
  const visibleConversations = useMemo(() => {
    const needle = normalizePhone(query);
    return conversations.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }
      if (needle && !normalizePhone(row.customer_phone).includes(needle)) {
        return false;
      }
      return true;
    });
  }, [conversations, query, statusFilter]);

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
  }

  async function refreshList(token: string | null) {
    const next = await listConversations(token);
    setConversations(next);
    setListError(null);
  }

  async function openThread(conversationId: string) {
    const requestId = ++openRequest.current;
    setSelectedId(conversationId);
    setMessages([]);
    setThreadLoading(true);
    setThreadError(null);
    try {
      const next = await listConversationMessages(await getToken(), conversationId);
      if (requestId !== openRequest.current) {
        return;
      }
      setMessages(next);
    } catch (err) {
      if (requestId !== openRequest.current) {
        return;
      }
      setThreadError(errorMessage(err));
    } finally {
      if (requestId === openRequest.current) {
        setThreadLoading(false);
      }
    }
  }

  function closeThread() {
    openRequest.current += 1;
    setSelectedId(null);
    setMessages([]);
    setThreadLoading(false);
    setThreadError(null);
  }

  async function onReply(text: string) {
    if (!selectedId) {
      return false;
    }
    setPending(true);
    setThreadError(null);
    try {
      const token = await getToken();
      const created = await replyToConversation(token, selectedId, text);
      setMessages((current) => [...current, created]);
      await refreshList(token);
      return true;
    } catch (err) {
      setThreadError(errorMessage(err));
      return false;
    } finally {
      setPending(false);
    }
  }

  async function onReturnToAgent() {
    if (!selectedId) {
      return;
    }
    setPending(true);
    setThreadError(null);
    try {
      const token = await getToken();
      const updated = await returnConversationToAgent(token, selectedId);
      setConversations((current) =>
        current.map((row) =>
          row.id === updated.id ? { ...row, status: updated.status } : row,
        ),
      );
    } catch (err) {
      setThreadError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  if (listError) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <h1 className={pageTitleClass}>Conversations</h1>
        <p className="mt-6 text-sm text-danger" role="alert">
          {listError}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className={pageTitleClass}>Conversations</h1>
      <p className="mt-2 text-sm text-zinc-500">
        {filtersActive
          ? `${visibleConversations.length} sur ${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`
          : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}
      </p>

      {conversations.length === 0 ? (
        <div className={`mt-8 ${emptyStateClass}`}>
          <p className="font-medium text-zinc-800">Aucune conversation pour le moment</p>
          <p className="mt-1 text-sm">
            Les échanges WhatsApp avec vos clients apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
              Rechercher un numéro
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex. 77 123 45 67"
                className={inputClass}
              />
            </label>
            <label className="flex max-w-xs flex-col gap-1 text-sm font-medium">
              Statut
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={inputClass}
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {conversationStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visibleConversations.length === 0 ? (
            <div className={`mt-8 ${emptyStateClass}`}>
              <p className="font-medium text-zinc-800">
                Aucune conversation ne correspond à votre recherche
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className={`${btnSecondary} mt-4`}
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {visibleConversations.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => openThread(row.id)}
                    className={`${cardInteractiveClass} flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between ${
                      isEscalated(row.status)
                        ? "border-l-4 border-l-warning"
                        : isClosed(row.status)
                          ? "border-l-4 border-l-zinc-300"
                          : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{row.customer_phone}</p>
                      <p className="truncate text-sm text-zinc-500">
                        {row.last_message_preview ?? "Aucun message"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {row.message_count} message
                        {row.message_count === 1 ? "" : "s"}
                        {row.last_message_at
                          ? ` · ${formatDate(row.last_message_at)}`
                          : ""}
                      </p>
                    </div>
                    <ConversationStatusBadge status={row.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selectedId && threadLoading && !selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chargement de la conversation"
            className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
          >
            <p className="text-sm text-zinc-500">Chargement de la conversation…</p>
          </div>
        </div>
      ) : null}

      {selectedId && threadError && !selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Erreur de conversation"
            className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
          >
            <p className="text-sm text-danger" role="alert">
              {threadError}
            </p>
          </div>
        </div>
      ) : null}

      {selected && !threadLoading ? (
        <ThreadPanel
          conversation={selected}
          messages={messages}
          pending={pending}
          error={threadError}
          onClose={closeThread}
          onReply={onReply}
          onReturnToAgent={onReturnToAgent}
        />
      ) : null}
    </div>
  );
}
