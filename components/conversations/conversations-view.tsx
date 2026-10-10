"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { errorMessage } from "@/lib/api";
import { displayWhatsAppError } from "@/lib/whatsapp-errors";
import {
  type ConversationListItem,
  type ConversationMessage,
  getConversation,
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
const THREAD_POLL_MS = 5_000;
const LIST_POLL_MS = 20_000;

function mergeMessages(
  current: ConversationMessage[],
  next: ConversationMessage[],
): ConversationMessage[] {
  if (
    current.length === next.length &&
    current.every((message, index) => message.id === next[index].id)
  ) {
    return current;
  }
  const previous = new Map(current.map((message) => [message.id, message]));
  return next.map((message) => previous.get(message.id) ?? message);
}

export function ConversationsView({
  initialConversations,
  initialError = null,
}: {
  initialConversations: ConversationListItem[];
  initialError?: string | null;
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get("conversation");
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
  const mutationVersion = useRef(0);
  const pollInFlight = useRef(false);
  const threadReadyRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

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

  useEffect(() => {
    if (conversationParam) {
      void openFromQuery(conversationParam);
      return;
    }
    closeThreadLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open from the query string only
  }, [conversationParam]);

  useEffect(() => {
    if (threadLoading) {
      return;
    }

    const intervalMs = selectedId ? THREAD_POLL_MS : LIST_POLL_MS;
    let cancelled = false;

    async function poll() {
      if (cancelled || pollInFlight.current) {
        return;
      }
      if (document.visibilityState !== "visible") {
        return;
      }
      const conversationId = selectedIdRef.current;
      if (conversationId && !threadReadyRef.current) {
        return;
      }
      pollInFlight.current = true;
      const requestId = openRequest.current;
      const version = mutationVersion.current;
      try {
        const token = await getToken();
        if (conversationId) {
          const [nextMessages, nextList] = await Promise.all([
            listConversationMessages(token, conversationId),
            listConversations(token),
          ]);
          if (
            cancelled ||
            requestId !== openRequest.current ||
            version !== mutationVersion.current ||
            selectedIdRef.current !== conversationId
          ) {
            return;
          }
          setMessages((current) => mergeMessages(current, nextMessages));
          setConversations(nextList);
        } else {
          const nextList = await listConversations(token);
          if (cancelled || selectedIdRef.current) {
            return;
          }
          setConversations(nextList);
        }
      } catch {
        // Keep the last good data; polling errors stay silent.
      } finally {
        pollInFlight.current = false;
      }
    }

    let timer = 0;

    function startTimer() {
      window.clearInterval(timer);
      if (document.visibilityState !== "visible") {
        return;
      }
      timer = window.setInterval(() => {
        void poll();
      }, intervalMs);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void poll();
        startTimer();
      } else {
        window.clearInterval(timer);
      }
    }

    startTimer();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [getToken, selectedId, threadLoading]);

  async function refreshList(token: string | null) {
    const next = await listConversations(token);
    setConversations(next);
    setListError(null);
  }

  async function openFromQuery(conversationId: string) {
    if (!conversations.some((row) => row.id === conversationId)) {
      try {
        const fetched = await getConversation(await getToken(), conversationId);
        setConversations((current) =>
          current.some((row) => row.id === fetched.id)
            ? current
            : [{ ...fetched, orders: fetched.orders ?? [] }, ...current],
        );
      } catch (err) {
        setSelectedId(conversationId);
        setThreadError(errorMessage(err));
        setThreadLoading(false);
        return;
      }
    }
    await openThread(conversationId);
  }

  async function openThread(conversationId: string) {
    const requestId = ++openRequest.current;
    threadReadyRef.current = false;
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
      threadReadyRef.current = true;
    } catch (err) {
      if (requestId !== openRequest.current) {
        return;
      }
      threadReadyRef.current = false;
      setThreadError(errorMessage(err));
    } finally {
      if (requestId === openRequest.current) {
        setThreadLoading(false);
      }
    }
  }

  function closeThreadLocal() {
    openRequest.current += 1;
    threadReadyRef.current = false;
    setSelectedId(null);
    setMessages([]);
    setThreadLoading(false);
    setThreadError(null);
  }

  function closeThread() {
    closeThreadLocal();
    if (conversationParam) {
      router.push("/conversations");
    }
  }

  async function onReply(text: string) {
    if (!selectedId) {
      return false;
    }
    mutationVersion.current += 1;
    setPending(true);
    setThreadError(null);
    try {
      const token = await getToken();
      const created = await replyToConversation(token, selectedId, text);
      setMessages((current) => [...current, created]);
      await refreshList(token);
      return true;
    } catch (err) {
      setThreadError(displayWhatsAppError(errorMessage(err)));
      return false;
    } finally {
      mutationVersion.current += 1;
      setPending(false);
    }
  }

  async function onReturnToAgent() {
    if (!selectedId) {
      return;
    }
    mutationVersion.current += 1;
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
      mutationVersion.current += 1;
      setPending(false);
    }
  }

  if (listError) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader title="Conversations" />
        <p className="mt-6 text-sm text-danger" role="alert">
          {listError}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Conversations"
        subtitle={
          filtersActive
            ? `${visibleConversations.length} sur ${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`
            : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`
        }
      />

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
                    onClick={() =>
                      router.push(`/conversations?conversation=${row.id}`)
                    }
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
                      {(row.orders ?? []).length > 0 ? (
                        <p className="text-xs text-zinc-500">
                          {(row.orders ?? []).length === 1
                            ? `Commande #${(row.orders ?? [])[0].order_number}`
                            : `${(row.orders ?? []).length} commandes`}
                        </p>
                      ) : null}
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
