"use client";

import { AlertTriangle, ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import type {
  ConversationListItem,
  ConversationMessage,
} from "@/lib/conversations-api";
import { ImagePreviewDialog } from "@/components/shared/authenticated-image";
import { cn } from "@/lib/cn";

import { DateSeparator } from "./date-separator";
import {
  dayKey,
  escalationReason,
  formatThreadDay,
  isEscalationNote,
} from "./helpers";
import { MessageBubble, threadMessageDomId } from "./message-bubble";
import { quotedForDisplay } from "./quoted-reply-block";
import { ThreadComposer } from "./thread-composer";
import { ThreadHeader } from "./thread-header";

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
  const [preview, setPreview] = useState<{
    imageId: string;
    title: string;
  } | null>(null);
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
        if (preview) {
          setPreview(null);
        } else {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending, preview]);

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

  const threadItems: ReactNode[] = [];
  {
    let lastDay: string | null = null;
    let lastRole: string | null = null;
    for (const message of messages) {
      const day = dayKey(message.created_at);
      if (day && day !== lastDay) {
        threadItems.push(
          <DateSeparator
            key={`day-${day}`}
            label={formatThreadDay(message.created_at)}
          />,
        );
        lastDay = day;
        lastRole = null;
      }

      if (isEscalationNote(message)) {
        threadItems.push(
          <li
            id={threadMessageDomId(message.id)}
            key={message.id}
            className="flex justify-center py-1"
          >
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-medium text-warning">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
              Escaladé : {escalationReason(message.display_text)}
            </span>
          </li>,
        );
        lastRole = null;
        continue;
      }

      const quoted =
        message.turn_role === "customer"
          ? quotedForDisplay(message.quoted)
          : null;
      const quotedTargetId = quoted?.message_id ?? null;
      const canJump =
        quotedTargetId !== null && loadedMessageIds.has(quotedTargetId);
      const showRole = lastRole !== message.turn_role;
      const tight = lastRole === message.turn_role;

      threadItems.push(
        <MessageBubble
          key={message.id}
          message={message}
          showRole={showRole}
          tight={tight}
          highlighted={highlightedMessageId === message.id}
          quoted={quoted}
          canJumpToQuoted={canJump}
          onJumpToQuoted={() => {
            if (quotedTargetId) {
              scrollToQuotedMessage(quotedTargetId);
            }
          }}
          onPreviewImage={(imageId, title) => setPreview({ imageId, title })}
          orders={linkedOrders}
        />,
      );
      lastRole = message.turn_role;
    }
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
    <div className="fixed inset-0 z-dialog flex items-stretch justify-center bg-transparent sm:items-center sm:bg-black/40 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-dvh w-full flex-col overflow-hidden bg-white sm:h-[85dvh] sm:max-w-2xl sm:rounded-card sm:border sm:border-zinc-200/80 sm:shadow-card"
      >
        <ThreadHeader
          conversation={conversation}
          titleId={titleId}
          onClose={onClose}
        />

        <div className="relative flex min-h-0 flex-1 flex-col bg-background">
          <ul
            ref={scrollerRef}
            onScroll={onThreadScroll}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-5"
          >
            {threadItems}
          </ul>
          {showNewMessages ? (
            <button
              type="button"
              aria-label="Nouveaux messages"
              onClick={scrollToLatest}
              className={cn(
                "absolute bottom-3 left-1/2 z-10 inline-flex h-10 -translate-x-1/2 items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 shadow-card",
                "motion-safe:transition-colors motion-safe:duration-150",
              )}
            >
              <ChevronDown className="size-4" aria-hidden="true" />
              Nouveaux messages
            </button>
          ) : null}
          <div key={liveTick} className="sr-only" aria-live="polite">
            {liveTick > 0 ? "Nouveau message du client." : ""}
          </div>
        </div>

        <ThreadComposer
          replyId={replyId}
          draft={draft}
          pending={pending}
          error={error}
          status={conversation.status}
          onDraftChange={setDraft}
          onDraftKeyDown={onDraftKeyDown}
          onSubmit={submitReply}
          onReturnToAgent={onReturnToAgent}
        />
      </div>
      {preview ? (
        <ImagePreviewDialog
          imageId={preview.imageId}
          title={preview.title}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </div>
  );
}
