"use client";

import { useId, type RefObject } from "react";
import { Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { bannerErrorClass, focusRingClass } from "@/lib/ui";

import { DELIVERY_PRESETS, type OnboardingDraft } from "./onboarding-types";

const PAYMENT_REQUIRED = "Au moins un mode de paiement est requis.";

export function StepDelivery({
  draft,
  headingRef,
  paymentError,
  onChange,
  onPaymentError,
}: {
  draft: OnboardingDraft;
  headingRef: RefObject<HTMLHeadingElement | null>;
  paymentError: string | null;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  onPaymentError: (message: string | null) => void;
}) {
  const cashId = useId();
  const onlineId = useId();

  function setPayment(field: "cashOnDelivery" | "onlinePayment", next: boolean) {
    const other =
      field === "cashOnDelivery" ? draft.onlinePayment : draft.cashOnDelivery;
    if (!next && !other) {
      onPaymentError(PAYMENT_REQUIRED);
      return;
    }
    onPaymentError(null);
    onChange({ [field]: next });
  }

  function toggleZone(city: string) {
    const selected = draft.zoneCities.includes(city);
    onChange({
      zoneCities: selected
        ? draft.zoneCities.filter((value) => value !== city)
        : [...draft.zoneCities, city],
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-page-title text-balance outline-none"
      >
        Livraison et paiement
      </h2>

      <Card>
        <p className="mb-3 text-sm font-medium text-zinc-800">Paiement</p>
        <div className="flex flex-col gap-2">
          <label
            htmlFor={cashId}
            className="flex min-h-11 items-center gap-3 text-sm font-medium"
          >
            <input
              id={cashId}
              type="checkbox"
              checked={draft.cashOnDelivery}
              onChange={(event) =>
                setPayment("cashOnDelivery", event.target.checked)
              }
              className="size-5"
            />
            Paiement à la livraison
          </label>
          <div>
            <label
              htmlFor={onlineId}
              className="flex min-h-11 items-center gap-3 text-sm font-medium"
            >
              <input
                id={onlineId}
                type="checkbox"
                checked={draft.onlinePayment}
                onChange={(event) =>
                  setPayment("onlinePayment", event.target.checked)
                }
                className="size-5"
              />
              Paiement en ligne
            </label>
            <p className="mt-1 pl-8 text-xs text-zinc-500">
              Ajoutez vos liens (Wave, Orange Money…) plus tard dans Paramètres.
            </p>
          </div>
        </div>
        {paymentError ? (
          <p className={`mt-3 ${bannerErrorClass}`} role="alert">
            {paymentError}
          </p>
        ) : null}
      </Card>

      <div>
        <p className="mb-2 text-sm font-medium text-zinc-800">
          Où livrez-vous ?
        </p>
        <div className="flex flex-wrap gap-2">
          {DELIVERY_PRESETS.map((zone) => {
            const selected = draft.zoneCities.includes(zone.city);
            return (
              <button
                key={zone.city}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleZone(zone.city)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium",
                  focusRingClass,
                  "motion-safe:transition-colors motion-safe:duration-150",
                  selected
                    ? "bg-accent text-white"
                    : "bg-accent-soft text-accent-text hover:bg-zinc-200",
                )}
              >
                {selected ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : null}
                {zone.city} ({zone.delayLabel})
              </button>
            );
          })}
        </div>
      </div>

      {draft.zoneCities.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {draft.zoneCities.map((city) => {
            const preset = DELIVERY_PRESETS.find((row) => row.city === city);
            if (!preset) {
              return null;
            }
            return (
              <li
                key={city}
                className="rounded-card border border-zinc-200 bg-white px-3 py-3 text-sm"
              >
                <p className="font-medium text-zinc-900">{city}</p>
                <p className="text-zinc-500">
                  Délai de livraison : {preset.minHours} à {preset.maxHours} h
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p className="text-caption text-zinc-500">
        Vous pourrez modifier les délais et préciser vos frais de livraison dans
        Paramètres.
      </p>
    </div>
  );
}
