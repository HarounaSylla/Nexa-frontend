"use client";

import { useEffect, useRef, useState } from "react";

import { NexaLogo } from "@/components/brand/nexa-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { bannerErrorClass } from "@/lib/ui";

import { completeOnboarding } from "@/app/onboarding/actions";

import { useOnboardingDraft } from "./use-onboarding-draft";
import { DELIVERY_PRESETS, ONBOARDING_STEP_LABELS } from "./onboarding-types";
import type { OnboardingFailedPart } from "./onboarding-types";
import { StepBoutique } from "./step-boutique";
import { StepCatalogue } from "./step-catalogue";
import { StepDelivery } from "./step-delivery";
import { StepDone } from "./step-done";
import { StepTikTok } from "./step-tiktok";
import { StepWhatsApp } from "./step-whatsapp";

export function OnboardingWizard({ preview }: { preview: boolean }) {
  const { draft, setDraft } = useOnboardingDraft();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [failed, setFailed] = useState<OnboardingFailedPart[]>([]);
  const [pending, setPending] = useState(false);

  const step = draft.step;
  const stepLabel = ONBOARDING_STEP_LABELS[step - 1] ?? "";

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo(0, 0);
  }, [step]);

  function patch(next: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function goTo(next: number) {
    setCommitError(null);
    setDraft((current) => ({ ...current, step: next }));
  }

  function canAdvance(): boolean {
    if (step === 1) {
      return draft.name.trim().length > 0;
    }
    if (step === 2) {
      return draft.whatsappRequested;
    }
    return true;
  }

  async function commitAndFinish() {
    if (pending) {
      return;
    }
    setPending(true);
    setCommitError(null);
    const zones = draft.zoneCities
      .map((city) => DELIVERY_PRESETS.find((row) => row.city === city))
      .filter((row): row is (typeof DELIVERY_PRESETS)[number] => Boolean(row))
      .map((row) => ({
        city: row.city,
        minHours: row.minHours,
        maxHours: row.maxHours,
      }));

    const result = await completeOnboarding({
      preview,
      name: draft.name.trim(),
      address: draft.address,
      hours: draft.hours,
      acceptsCashOnDelivery: draft.cashOnDelivery,
      acceptsOnlinePayment: draft.onlinePayment,
      zones,
      products: draft.products.map((product) => ({
        name: product.name,
        price: product.price,
        category: product.category,
        stock_qty: product.stock_qty,
      })),
    });

    setPending(false);
    if (!result.ok) {
      setCommitError(result.error);
      return;
    }
    setFailed(result.failed);
    setDraft((current) => ({ ...current, step: 6 }));
  }

  function onPrimary() {
    if (step === 5) {
      void commitAndFinish();
      return;
    }
    if (step < 5 && canAdvance()) {
      goTo(step + 1);
    }
  }

  function onSkip() {
    if (step === 5) {
      void commitAndFinish();
      return;
    }
    if (step >= 3 && step <= 4) {
      goTo(step + 1);
    }
  }

  const primaryLabel =
    pending && step === 5
      ? "Création de votre boutique…"
      : step === 5
        ? "Terminer"
        : "Suivant";

  const skipLabel =
    step === 3
      ? "Passer pour l'instant"
      : step === 4
        ? "Passer, je le ferai dans Paramètres"
        : step === 5
          ? "Passer"
          : null;

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background">
      <header className="border-b border-zinc-200/80 bg-white px-4 py-3">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3">
          <NexaLogo wordmarkClassName="" />
          <p className="text-caption text-right text-zinc-500">
            Étape {step} sur 6 · {stepLabel}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={6}
          aria-valuenow={step}
          aria-valuetext={`Étape ${step} sur 6, ${stepLabel}`}
          className="mx-auto mt-3 flex w-full max-w-lg gap-1"
        >
          {ONBOARDING_STEP_LABELS.map((label, index) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full",
                index < step ? "bg-accent" : "bg-zinc-200",
              )}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col md:items-center md:justify-start md:px-4 md:py-8">
        <div className="flex w-full flex-1 flex-col bg-background md:max-w-lg md:flex-none md:rounded-card md:border md:border-zinc-200/80 md:bg-white md:shadow-card">
          <div
            className={cn(
              "flex-1 px-4 pt-6",
              "pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-4",
              "motion-safe:transition-opacity motion-safe:duration-150",
            )}
          >
            {step === 1 ? (
              <StepBoutique
                draft={draft}
                headingRef={headingRef}
                onChange={patch}
                onSubmitName={() => {
                  if (draft.name.trim()) {
                    goTo(2);
                  }
                }}
              />
            ) : null}
            {step === 2 ? (
              <StepWhatsApp
                draft={draft}
                headingRef={headingRef}
                onChange={patch}
              />
            ) : null}
            {step === 3 ? (
              <StepCatalogue
                draft={draft}
                headingRef={headingRef}
                onChange={patch}
              />
            ) : null}
            {step === 4 ? (
              <StepDelivery
                draft={draft}
                headingRef={headingRef}
                paymentError={paymentError}
                onChange={patch}
                onPaymentError={setPaymentError}
              />
            ) : null}
            {step === 5 ? (
              <StepTikTok
                draft={draft}
                headingRef={headingRef}
                onChange={patch}
              />
            ) : null}
            {step === 6 ? (
              <StepDone draft={draft} failed={failed} headingRef={headingRef} />
            ) : null}

            {commitError ? (
              <p className={`mt-4 ${bannerErrorClass}`} role="alert">
                {commitError}
              </p>
            ) : null}
          </div>

          {step < 6 ? (
            <div
              className={cn(
                "border-t border-zinc-200 bg-white px-4 pt-3",
                "fixed inset-x-0 bottom-0 z-header pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:z-auto md:rounded-b-card md:pb-4",
              )}
            >
              <div className="mx-auto flex w-full max-w-lg flex-col gap-2">
                <div className="flex gap-2">
                  {step >= 2 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      disabled={pending}
                      onClick={() => goTo(step - 1)}
                    >
                      Retour
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    className="flex-1"
                    loading={pending}
                    disabled={!canAdvance() || pending}
                    onClick={onPrimary}
                  >
                    {primaryLabel}
                  </Button>
                </div>
                {skipLabel ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    disabled={pending}
                    onClick={onSkip}
                  >
                    {skipLabel}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
