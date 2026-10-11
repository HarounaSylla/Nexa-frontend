import Link from "next/link";

import { NexaLogo } from "@/components/brand/nexa-logo";
import { Button } from "@/components/ui/button";
import { focusRingClass } from "@/lib/ui";
import { cn } from "@/lib/cn";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-header border-b border-zinc-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between gap-2 px-4 sm:h-16">
        <Link
          href="/"
          aria-label="Nexa, accueil"
          className={cn("min-w-0 shrink rounded-control", focusRingClass)}
        >
          <NexaLogo />
        </Link>
        <nav
          aria-label="Compte"
          className="flex shrink-0 flex-nowrap items-center gap-1 sm:gap-2"
        >
          <Button
            href="/sign-in"
            variant="ghost"
            size="sm"
            className="h-11 min-h-11 whitespace-nowrap px-3 font-medium text-zinc-700 sm:h-10 sm:min-h-10"
          >
            Se connecter
          </Button>
          <Button
            href="/sign-up"
            size="sm"
            className="h-11 min-h-11 whitespace-nowrap px-4 sm:h-10 sm:min-h-10"
          >
            Créer un compte
          </Button>
        </nav>
      </div>
    </header>
  );
}
