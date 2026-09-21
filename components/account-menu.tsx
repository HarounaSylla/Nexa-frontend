"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { ShopAvatar } from "@/components/shop-mark";
import { cardClass } from "@/lib/ui";

export function AccountMenu({ shopName }: { shopName: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
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
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-full hover:opacity-90"
      >
        <ShopAvatar name={shopName} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`${cardClass} absolute right-0 z-40 mt-2 w-56 p-1`}
        >
          <p className="truncate px-3 py-2 text-sm font-medium text-zinc-900">
            {shopName}
          </p>
          <Link
            role="menuitem"
            href="/parametres"
            onClick={() => setOpen(false)}
            className="block rounded-control px-3 py-2 text-sm text-zinc-700 hover:bg-accent-soft"
          >
            Settings
          </Link>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              role="menuitem"
              className="block w-full rounded-control px-3 py-2 text-left text-sm text-zinc-700 hover:bg-accent-soft"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      ) : null}
    </div>
  );
}
