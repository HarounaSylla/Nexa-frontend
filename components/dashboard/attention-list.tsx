import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
  MessageCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

export function AttentionList({
  proofCount,
  escalatedCount,
  outOfStockCount,
}: {
  proofCount: number;
  escalatedCount: number;
  outOfStockCount: number;
}) {
  const rows = [
    proofCount > 0
      ? {
          href: "/commandes",
          icon: CreditCard,
          label:
            proofCount === 1
              ? "1 preuve de paiement à vérifier"
              : `${proofCount} preuves de paiement à vérifier`,
        }
      : null,
    escalatedCount > 0
      ? {
          href: "/conversations",
          icon: MessageCircle,
          label:
            escalatedCount === 1
              ? "1 conversation attend votre réponse"
              : `${escalatedCount} conversations attendent votre réponse`,
        }
      : null,
    outOfStockCount > 0
      ? {
          href: "/catalogue",
          icon: AlertTriangle,
          label:
            outOfStockCount === 1
              ? "1 produit en rupture"
              : `${outOfStockCount} produits en rupture`,
        }
      : null,
  ].filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return null;
  }

  return (
    <Card flush className="mt-6 overflow-hidden">
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-section-title">À traiter</h2>
      </div>
      <ul className="divide-y divide-zinc-100">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li key={row.href + row.label}>
              <Link
                href={row.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-900",
                  "hover:bg-accent-soft motion-safe:transition-colors motion-safe:duration-150",
                  focusRingClass,
                )}
              >
                <Icon className="size-4 shrink-0 text-accent-text" aria-hidden="true" />
                <span className="min-w-0 flex-1">{row.label}</span>
                <ChevronRight
                  className="size-4 shrink-0 text-zinc-400"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
