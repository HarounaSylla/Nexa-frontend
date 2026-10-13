"use client";

import { useId, useState, type RefObject } from "react";
import { MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

import {
  formatSenegalDisplay,
  isCompleteNationalNumber,
  normalizeNationalNumber,
} from "./onboarding-phone";
import { requestAssistedWhatsApp } from "./onboarding-simulated";
import type { OnboardingDraft } from "./onboarding-types";

export function StepWhatsApp({
  draft,
  headingRef,
  onChange,
}: {
  draft: OnboardingDraft;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}) {
  const numberId = useId();
  const existingId = useId();
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submitRequest() {
    const national = normalizeNationalNumber(draft.whatsappNational);
    if (!isCompleteNationalNumber(national)) {
      setPhoneError("Indiquez les 9 chiffres de votre numéro.");
      return;
    }
    setPhoneError(null);
    setSending(true);
    try {
      await requestAssistedWhatsApp({
        e164: `+221${national}`,
        clientsAlreadyWrite: draft.whatsappExistingClients,
      });
      onChange({ whatsappNational: national, whatsappRequested: true });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-page-title text-balance outline-none"
      >
        Connectez votre WhatsApp
      </h2>

      <div className="flex flex-col gap-3">
        <div
          aria-disabled="true"
          className="rounded-card border border-zinc-200/80 bg-white p-4 opacity-70 shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-zinc-900">Connecter avec Meta</p>
              <p className="mt-1 text-sm text-zinc-500">
                Connexion automatique dès que Nexa sera partenaire Meta.
              </p>
            </div>
            <Badge tone="muted">Bientôt</Badge>
          </div>
        </div>

        <Card className="border-accent/30 ring-1 ring-accent/15">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-text">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-zinc-900">Je préfère être aidé</p>
              <p className="mt-1 text-sm text-zinc-500">
                L&apos;équipe Nexa branche votre numéro pour vous.
              </p>
            </div>
          </div>

          {draft.whatsappRequested ? (
            <div className="mt-4 flex flex-col gap-3">
              <p
                className="rounded-control border border-success/20 bg-success-soft px-3 py-2 text-sm text-success"
                role="status"
              >
                Demande envoyée. Numéro à brancher :{" "}
                {formatSenegalDisplay(draft.whatsappNational)}. L&apos;équipe
                Nexa vous contacte pour finaliser la connexion. Vous pouvez
                continuer la configuration en attendant.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => onChange({ whatsappRequested: false })}
              >
                Modifier la demande
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <Field label="Numéro WhatsApp" htmlFor={numberId} error={phoneError ?? undefined}>
                <div className="flex min-w-0 items-stretch gap-2">
                  <span className="inline-flex h-11 shrink-0 items-center rounded-control border border-zinc-200 bg-accent-soft px-3 text-base text-zinc-700">
                    +221
                  </span>
                  <Input
                    id={numberId}
                    inputMode="tel"
                    autoComplete="tel-national"
                    maxLength={11}
                    value={draft.whatsappNational}
                    onChange={(event) => {
                      setPhoneError(null);
                      onChange({
                        whatsappNational: normalizeNationalNumber(
                          event.target.value,
                        ),
                      });
                    }}
                    placeholder="77 123 45 67"
                    className="text-base"
                  />
                </div>
              </Field>
              <label
                htmlFor={existingId}
                className={cn(
                  "flex min-h-11 items-center gap-3 text-sm font-medium",
                  focusRingClass,
                )}
              >
                <input
                  id={existingId}
                  type="checkbox"
                  checked={draft.whatsappExistingClients}
                  onChange={(event) =>
                    onChange({
                      whatsappExistingClients: event.target.checked,
                    })
                  }
                  className="size-5"
                />
                Mes clients m&apos;écrivent déjà sur ce numéro
              </label>
              <Button
                type="button"
                className="w-full"
                loading={sending}
                onClick={() => void submitRequest()}
              >
                Demander le branchement
              </Button>
            </div>
          )}
        </Card>
      </div>

      {!draft.whatsappRequested ? (
        <p className="text-caption text-zinc-500">
          Demandez le branchement de votre numéro pour continuer.
        </p>
      ) : null}
    </div>
  );
}
