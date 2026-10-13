"use client";

import type { ReactNode, RefObject } from "react";
import { Check, Circle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import type { OnboardingDraft, OnboardingFailedPart } from "./onboarding-types";

const FAILED_LABEL: Record<OnboardingFailedPart, string> = {
  preferences: "les informations de la boutique",
  zones: "les zones de livraison",
  products: "les produits",
};

export function StepDone({
  draft,
  failed,
  headingRef,
}: {
  draft: OnboardingDraft;
  failed: OnboardingFailedPart[];
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const productCount = draft.products.length;
  const zoneCount = draft.zoneCities.length;

  return (
    <div className="flex flex-col gap-4">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-page-title text-balance outline-none"
      >
        C&apos;est prêt, {draft.name.trim() || "votre boutique"}
      </h2>

      {failed.length > 0 ? (
        <p
          className="rounded-control border border-warning/20 bg-warning-soft px-3 py-2 text-sm text-warning"
          role="status"
        >
          Certaines informations n&apos;ont pas pu être enregistrées :{" "}
          {failed.map((part) => FAILED_LABEL[part]).join(", ")}. Complétez-les
          dans Paramètres ou Catalogue.
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        <CheckRow
          ok
          title="Boutique"
          detail={`${draft.name.trim()} · ${draft.city}`}
        />
        <CheckRow
          ok={false}
          title="WhatsApp"
          detail="En attente de branchement par l'équipe Nexa"
        />
        <CheckRow
          ok={productCount > 0}
          title="Catalogue"
          detail={
            productCount > 0
              ? `${productCount} produit${productCount > 1 ? "s" : ""}`
              : "À remplir depuis l'écran Catalogue"
          }
          action={
            productCount === 0 ? (
              <Button href="/catalogue" variant="secondary" size="sm">
                Ajouter
              </Button>
            ) : null
          }
        />
        <CheckRow
          ok={zoneCount > 0}
          title="Livraison et paiement"
          detail={
            zoneCount > 0
              ? `${zoneCount} zone${zoneCount > 1 ? "s" : ""}`
              : "À régler dans Paramètres"
          }
          action={
            zoneCount === 0 ? (
              <Button href="/parametres" variant="secondary" size="sm">
                Régler
              </Button>
            ) : null
          }
        />
        <CheckRow
          ok={false}
          title="TikTok"
          detail={
            draft.tiktokNotify
              ? "Bientôt disponible, nous vous prévenons"
              : "Bientôt disponible"
          }
        />
      </ul>

      <p className="text-sm text-zinc-500">
        Le tableau de bord vous rappellera ce qu&apos;il reste à faire.
      </p>

      <Button asChild className="w-full">
        <Link href="/dashboard">Aller au tableau de bord</Link>
      </Button>
    </div>
  );
}

function CheckRow({
  ok,
  title,
  detail,
  action,
}: {
  ok: boolean;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          ok ? "bg-success-soft text-success" : "bg-accent-soft text-zinc-500",
        )}
      >
        {ok ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Circle className="size-3.5" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-900">{title}</p>
        <p className="text-sm text-zinc-500">{detail}</p>
      </div>
      {action}
    </li>
  );
}
