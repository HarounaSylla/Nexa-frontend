"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { MessageCircle, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
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
import { focusRingClass } from "@/lib/ui";

import { ConversationAvatar } from "./conversation-avatar";
import {
  conversationStatusLabel,
  formatListTime,
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
      toast.success("Conversation renvoyée à l'agent");
    } catch (err) {
      const message = errorMessage(err);
      setThreadError(message);
      toast.error(message);
    } finally {
      mutationVersion.current += 1;
      setPending(false);
    }
  }

  const statusCounts = {
    all: conversations.length,
    active: conversations.filter((row) => row.status === "active").length,
    escalated: conversations.filter((row) => row.status === "escalated").length,
    closed: conversations.filter((row) => row.status === "closed").length,
  };

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
        <EmptyState
          className="mt-8"
          icon={<MessageCircle className="size-5" aria-hidden="true" />}
          title="Aucune conversation pour le moment"
          description="Les échanges WhatsApp avec vos clients apparaîtront ici."
        />
      ) : (
        <>
          <div className="relative mt-4">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <label htmlFor="conversation-search" className="sr-only">
              Rechercher un numéro
            </label>
            <Input
              id="conversation-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex. 77 123 45 67"
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

          <div
            role="group"
            aria-label="Filtrer par statut"
            className="mt-3 flex gap-2 overflow-x-auto pb-1"
          >
            {STATUS_FILTERS.map((status) => {
              const selectedFilter = statusFilter === status;
              const count = statusCounts[status];
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={selectedFilter}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium tabular-nums",
                    "motion-safe:transition-colors motion-safe:duration-150",
                    focusRingClass,
                    selectedFilter
                      ? "bg-accent text-white"
                      : "bg-accent-soft text-accent-text hover:bg-zinc-200",
                  )}
                >
                  {conversationStatusLabel(status)}
                  <span className={selectedFilter ? "text-white/80" : "text-zinc-500"}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {visibleConversations.length === 0 ? (
            <EmptyState
              className="mt-8"
              icon={<MessageCircle className="size-5" aria-hidden="true" />}
              title="Aucune conversation ne correspond à votre recherche"
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          ) : (
            <Card flush className="mt-4 overflow-hidden">
              <ul className="divide-y divide-zinc-100">
                {visibleConversations.map((row) => {
                  const orders = row.orders ?? [];
                  const closed = isClosed(row.status);
                  return (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/conversations?conversation=${row.id}`)
                        }
                        className={cn(
                          "flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left",
                          "motion-safe:transition-colors motion-safe:duration-150",
                          focusRingClass,
                          "hover:bg-accent-soft",
                          closed && "text-zinc-500",
                        )}
                      >
                        <ConversationAvatar
                          phone={row.customer_phone}
                          escalated={isEscalated(row.status)}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate font-medium",
                              closed ? "text-zinc-600" : "text-zinc-900",
                            )}
                          >
                            {row.customer_phone}
                          </p>
                          <p className="truncate text-sm text-zinc-500">
                            {row.last_message_preview ?? "Aucun message"}
                          </p>
                          {orders.length > 0 ? (
                            <p className="truncate text-caption text-zinc-500">
                              {orders.length === 1
                                ? `Commande #${orders[0].order_number}`
                                : `${orders.length} commandes`}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <p className="text-caption tabular-nums text-zinc-500">
                            {formatListTime(row.last_message_at)}
                          </p>
                          <ConversationStatusBadge status={row.status} />
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

      <Dialog
        open={Boolean(selectedId && threadLoading && !selected)}
        onOpenChange={(open) => {
          if (!open) {
            closeThread();
          }
        }}
      >
        <DialogContent title="Chargement de la conversation">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-5/6" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedId && threadError && !selected)}
        onOpenChange={(open) => {
          if (!open) {
            closeThread();
          }
        }}
      >
        <DialogContent title="Conversation">
          <p className="text-sm text-danger" role="alert">
            {threadError}
          </p>
          <Button className="mt-4" variant="secondary" onClick={closeThread}>
            Fermer
          </Button>
        </DialogContent>
      </Dialog>

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
