"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { ShopAvatar } from "@/components/shop-mark";
import { IconButton } from "@/components/ui/icon-button";
import { cardClass } from "@/lib/ui";

export function AccountMenu({ shopName }: { shopName: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const menuId = useId();

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
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const first = itemRefs.current[0];
    first?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const items = itemRefs.current.filter((node): node is HTMLElement => node !== null);
    if (items.length === 0) {
      return;
    }
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(current + 1 + items.length) % items.length]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(current - 1 + items.length) % items.length]?.focus();
    }
    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    }
    if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        label="Menu du compte"
        onClick={() => setOpen((value) => !value)}
        className="hover:opacity-90"
      >
        <ShopAvatar name={shopName} />
      </IconButton>
      {open ? (
        <div
          id={menuId}
          role="menu"
          onKeyDown={onMenuKeyDown}
          className={`${cardClass} absolute right-0 z-overlay mt-2 w-56 p-1`}
        >
          <p className="truncate px-3 py-2 text-sm font-medium text-zinc-900">
            {shopName}
          </p>
          <Link
            role="menuitem"
            href="/parametres"
            ref={(node) => {
              itemRefs.current[0] = node;
            }}
            onClick={() => setOpen(false)}
            className="block rounded-control px-3 py-2.5 text-sm text-zinc-700 outline-none hover:bg-accent-soft focus-visible:bg-accent-soft"
          >
            Paramètres
          </Link>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              role="menuitem"
              ref={(node) => {
                itemRefs.current[1] = node;
              }}
              className="block w-full rounded-control px-3 py-2.5 text-left text-sm text-zinc-700 outline-none hover:bg-accent-soft focus-visible:bg-accent-soft"
            >
              Se déconnecter
            </button>
          </SignOutButton>
        </div>
      ) : null}
    </div>
  );
}
