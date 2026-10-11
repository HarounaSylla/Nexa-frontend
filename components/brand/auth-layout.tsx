import Link from "next/link";

import { NexaLogo } from "@/components/brand/nexa-logo";
import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      <Link
        href="/"
        aria-label="Nexa, accueil"
        className={cn("rounded-control", focusRingClass)}
      >
        <NexaLogo wordmarkClassName="" />
      </Link>
      {children}
    </div>
  );
}
