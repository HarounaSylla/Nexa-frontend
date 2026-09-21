"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { BellIcon } from "@/components/icons";
import { errorMessage } from "@/lib/api";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/notifications-api";

import {
  notificationHref,
  notificationSentence,
  unreadCount,
} from "./notification-copy";

const POLL_MS = 45_000;

export function NotificationBell() {
  const { getToken } = useAuth();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function refresh() {
    try {
      const next = await listNotifications(await getToken());
      setItems(next);
      setStatus("ready");
      setError(null);
    } catch (err) {
      setStatus("error");
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await listNotifications(await getToken());
        if (!cancelled) {
          setItems(next);
          setStatus("ready");
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(errorMessage(err));
        }
      }
    })();
    const timer = window.setInterval(() => {
      if (cancelled) {
        return;
      }
      void (async () => {
        try {
          const next = await listNotifications(await getToken());
          if (!cancelled) {
            setItems(next);
            setStatus("ready");
            setError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setStatus("error");
            setError(errorMessage(err));
          }
        }
      })();
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [getToken]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const unread = unreadCount(items);
  const badgeLabel = unread > 99 ? "99+" : String(unread);

  async function togglePanel() {
    const next = !open;
    setOpen(next);
    if (next) {
      await refresh();
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
      router.push(notificationHref(item.type));
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
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          unread > 0
            ? `Notifications, ${unread} non lues`
            : "Notifications"
        }
        onClick={togglePanel}
        className="relative inline-flex size-10 items-center justify-center rounded-full text-zinc-700 hover:bg-accent-soft"
      >
        <BellIcon className="size-5" />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white">
            {badgeLabel}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 w-[min(100vw-1.5rem,22rem)] rounded-card border border-zinc-200/80 bg-white shadow-card-hover"
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2">
            <p className="font-display text-sm font-bold">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                disabled={pending}
                onClick={onMarkAllRead}
                className="text-xs font-medium text-accent disabled:opacity-60"
              >
                Tout marquer comme lu
              </button>
            ) : null}
          </div>
          <NotificationPanelBody
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
  status,
  error,
  items,
  pending,
  onSelect,
}: {
  status: "loading" | "ready" | "error";
  error: string | null;
  items: NotificationItem[];
  pending: boolean;
  onSelect: (item: NotificationItem) => void;
}) {
  if (status === "loading") {
    return (
      <p className="px-3 py-6 text-sm text-zinc-500">
        Chargement des notifications…
      </p>
    );
  }

  if (status === "error" && items.length === 0) {
    return (
      <p className="px-3 py-6 text-sm text-danger" role="alert">
        {error ?? "Impossible de charger les notifications."}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <p className="text-sm font-medium">Aucune notification pour le moment</p>
        <p className="mt-1 text-xs text-zinc-500">
          Les alertes de commandes, conversations et stock apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && status === "error" ? (
        <p className="px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="max-h-[min(24rem,70dvh)] overflow-y-auto p-1">
        {items.map((item) => {
          const unreadItem = item.read_at == null;
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={pending}
                onClick={() => onSelect(item)}
                className={`flex w-full items-start gap-2 rounded-control px-3 py-2.5 text-left text-sm transition-shadow disabled:opacity-60 ${
                  unreadItem
                    ? "bg-warning-soft font-medium text-zinc-900"
                    : "font-normal text-zinc-600 hover:shadow-card"
                }`}
              >
                {unreadItem ? (
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-warning"
                  />
                ) : (
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0" />
                )}
                <span>{notificationSentence(item)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
