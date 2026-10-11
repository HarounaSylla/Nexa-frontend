"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Bell } from "lucide-react";

import {
  NOTIFICATION_LIST_CLASS,
  NotificationRow,
} from "@/components/notifications/notification-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/api";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/notifications-api";
import { bannerErrorClass } from "@/lib/ui";

import { notificationHref, unreadCount } from "./notification-copy";

const POLL_MS = 45_000;

export function NotificationBell() {
  const { getToken } = useAuth();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const pull = useCallback(async () => {
    return listNotifications(await getToken());
  }, [getToken]);

  function commitList(next: NotificationItem[]) {
    setItems(next);
    setStatus("ready");
    setError(null);
  }

  function commitError(err: unknown) {
    setStatus("error");
    setError(errorMessage(err));
  }

  async function refresh() {
    try {
      commitList(await pull());
    } catch (err) {
      commitError(err);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await pull();
        if (!cancelled) {
          commitList(next);
        }
      } catch (err) {
        if (!cancelled) {
          commitError(err);
        }
      }
    })();
    const timer = window.setInterval(() => {
      void (async () => {
        try {
          const next = await pull();
          if (!cancelled) {
            commitList(next);
          }
        } catch (err) {
          if (!cancelled) {
            commitError(err);
          }
        }
      })();
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pull]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || status === "loading") {
      return;
    }
    const first = listRef.current?.querySelector<HTMLElement>("button, a");
    (first ?? panelRef.current)?.focus();
  }, [open, status]);

  const unread = unreadCount(items);
  const badgeLabel = unread > 99 ? "99+" : String(unread);

  async function togglePanel() {
    const next = !open;
    setOpen(next);
    if (next) {
      await refresh();
    } else {
      triggerRef.current?.focus();
    }
  }

  async function onSelect(item: NotificationItem) {
    setPending(true);
    try {
      if (item.read_at == null) {
        const updated = await markNotificationRead(await getToken(), item.id);
        setItems((current) =>
          current.map((row) => (row.id === updated.id ? updated : row)),
        );
      }
      setOpen(false);
      router.push(notificationHref(item));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function onMarkAllRead() {
    setPending(true);
    try {
      await markAllNotificationsRead(await getToken());
      const now = new Date().toISOString();
      setItems((current) =>
        current.map((row) => (row.read_at ? row : { ...row, read_at: now })),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        label={
          unread > 0
            ? `Notifications, ${unread} non lues`
            : "Notifications"
        }
        onClick={() => void togglePanel()}
        className="relative"
      >
        <Bell className="size-5" strokeWidth={1.75} aria-hidden="true" />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white tabular-nums">
            {badgeLabel}
          </span>
        ) : null}
      </IconButton>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          tabIndex={-1}
          className={cn(
            "z-overlay flex flex-col overflow-hidden rounded-card border border-zinc-200/80 bg-white shadow-card-hover",
            "fixed inset-x-3 top-16 max-h-[70dvh]",
            "sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[min(100vw-1.5rem,22rem)]",
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2">
            <p className="font-display text-sm font-bold">Notifications</p>
            {unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => void onMarkAllRead()}
              >
                Tout marquer comme lu
              </Button>
            ) : null}
          </div>
          <NotificationPanelBody
            listRef={listRef}
            status={status}
            error={error}
            items={items}
            pending={pending}
            onSelect={onSelect}
          />
        </div>
      ) : null}
    </div>
  );
}

function NotificationPanelBody({
  listRef,
  status,
  error,
  items,
  pending,
  onSelect,
}: {
  listRef: RefObject<HTMLUListElement | null>;
  status: "loading" | "ready" | "error";
  error: string | null;
  items: NotificationItem[];
  pending: boolean;
  onSelect: (item: NotificationItem) => void;
}) {
  if (status === "loading") {
    return (
      <div className="flex flex-col gap-0 p-1">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex min-h-11 items-start gap-3 px-3 py-3">
            <Skeleton className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "error" && items.length === 0) {
    return (
      <p className={`m-3 ${bannerErrorClass}`} role="alert">
        {error ?? "Impossible de charger les notifications."}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        className="m-3 py-8"
        icon={<Bell className="size-5" aria-hidden="true" />}
        title="Aucune notification pour le moment"
        description="Les alertes de commandes, conversations et stock apparaîtront ici."
      />
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {error && status === "error" ? (
        <p className={`mx-3 mt-2 ${bannerErrorClass}`} role="alert">
          {error}
        </p>
      ) : null}
      <ul ref={listRef} className={NOTIFICATION_LIST_CLASS}>
        {items.map((item) => (
          <li key={item.id}>
            <NotificationRow
              item={item}
              disabled={pending}
              onClick={() => onSelect(item)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
