"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountMenu } from "@/components/account-menu";
import { NavIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ShopMark } from "@/components/shop-mark";
import { isActivePath, NAV_ITEMS } from "@/lib/nav";

export function AppShell({
  shopName,
  children,
}: {
  shopName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white shadow-card">
        <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
            <ShopMark name={shopName} />
            <p className="min-w-0 truncate font-display text-sm font-bold">
              {shopName}
            </p>
          </div>
          <div className="hidden min-w-0 flex-1 md:block" />
          <ChannelToggle />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NotificationBell />
            <AccountMenu shopName={shopName} />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col border-r border-zinc-200/80 bg-white md:flex">
          <div className="flex items-center gap-2 px-3 pt-3">
            <ShopMark name={shopName} />
            <p className="min-w-0 truncate font-display text-sm font-bold">
              {shopName}
            </p>
          </div>
          <nav aria-label="Main" className="flex flex-col gap-1 p-3">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-control px-3 py-2.5 font-display text-sm font-semibold ${
                    active
                      ? "bg-accent text-white"
                      : "text-zinc-700 hover:bg-accent-soft hover:text-accent-text"
                  }`}
                >
                  <NavIcon name={item.icon} className="size-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-8">
          {children}
        </main>
      </div>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/80 bg-white pb-[env(safe-area-inset-bottom)] shadow-card md:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 px-1 py-2 font-display text-[11px] font-semibold ${
                    active ? "text-accent" : "text-zinc-500"
                  }`}
                >
                  <NavIcon name={item.icon} className="size-5" />
                  <span className="truncate">{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function ChannelToggle() {
  return (
    <div
      role="group"
      aria-label="Channel"
      className="inline-flex shrink-0 items-center rounded-full border border-zinc-200 bg-accent-soft p-0.5"
    >
      <button
        type="button"
        aria-pressed="true"
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 shadow-card sm:px-3 sm:text-sm"
      >
        <WhatsAppIcon className="size-4 text-success" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Coming soon"
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-zinc-400 sm:px-3 sm:text-sm"
      >
        <TikTokIcon className="size-4" />
        <span className="hidden sm:inline">TikTok</span>
        <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Bientôt
        </span>
      </button>
    </div>
  );
}
