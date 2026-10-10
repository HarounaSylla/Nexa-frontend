"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountMenu } from "@/components/account-menu";
import { NavIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ShopMark } from "@/components/shop-mark";
import { PageContainer } from "@/components/ui/page-container";
import { cn } from "@/lib/cn";
import { isActivePath, NAV_ITEMS } from "@/lib/nav";
import { focusRingClass } from "@/lib/ui";

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
      <header className="sticky top-0 z-header border-b border-zinc-200/80 bg-white shadow-header">
        <div className="flex min-h-14 items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ShopMark name={shopName} />
            <p className="min-w-0 truncate font-display text-sm font-bold text-zinc-900">
              {shopName}
            </p>
          </div>
          <ChannelToggle />
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <NotificationBell />
            <AccountMenu shopName={shopName} />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col border-r border-zinc-200/80 bg-white md:flex">
          <nav
            aria-label="Navigation principale"
            className="flex flex-col gap-1 p-3"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-control px-3 py-2.5 font-display text-sm font-semibold",
                    "motion-safe:transition-colors motion-safe:duration-150",
                    focusRingClass,
                    active
                      ? "bg-accent text-white"
                      : "text-zinc-700 hover:bg-accent-soft hover:text-accent-text",
                  )}
                >
                  <NavIcon name={item.icon} className="size-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-7 md:px-8 md:pb-8">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-nav border-t border-zinc-200/80 bg-white pb-[env(safe-area-inset-bottom)] shadow-header md:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-center font-display text-[10px] leading-tight",
                    "motion-safe:transition-colors motion-safe:duration-150",
                    focusRingClass,
                    active
                      ? "font-bold text-accent-text"
                      : "font-semibold text-zinc-500 hover:text-zinc-800",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-4 py-1",
                      active && "bg-accent-soft",
                    )}
                  >
                    <NavIcon
                      name={item.icon}
                      className="size-5"
                      strokeWidth={active ? 2.25 : 1.75}
                    />
                  </span>
                  <span className="max-w-full whitespace-normal">
                    {item.shortLabel}
                  </span>
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
      aria-label="Canal"
      className="inline-flex h-11 shrink-0 items-center rounded-full border border-zinc-200 bg-accent-soft p-0.5"
    >
      <button
        type="button"
        aria-pressed="true"
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-medium text-zinc-900 shadow-card sm:px-3 sm:text-sm",
          focusRingClass,
        )}
      >
        <WhatsAppIcon className="size-4 text-success" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Bientôt disponible"
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-zinc-400 sm:px-3 sm:text-sm"
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
