"use client";

import { useId, type RefObject } from "react";

import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { TEXT_FIELD_MAX } from "@/components/parametres/preferences-helpers";

import { SHOP_CITIES, type OnboardingDraft } from "./onboarding-types";

export function StepBoutique({
  draft,
  headingRef,
  onChange,
  onSubmitName,
}: {
  draft: OnboardingDraft;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  onSubmitName: () => void;
}) {
  const nameId = useId();
  const cityId = useId();
  const addressId = useId();
  const hoursId = useId();

  return (
    <div className="flex flex-col gap-4">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-page-title text-balance outline-none"
      >
        Parlons de votre boutique
      </h2>
      <Field label="Nom de la boutique" htmlFor={nameId}>
        <Input
          id={nameId}
          name="name"
          type="text"
          required
          maxLength={200}
          autoComplete="organization"
          value={draft.name}
          onChange={(event) => onChange({ name: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter" && draft.name.trim()) {
              event.preventDefault();
              onSubmitName();
            }
          }}
        />
      </Field>
      <Field label="Ville" htmlFor={cityId}>
        <Select
          id={cityId}
          value={draft.city}
          onChange={(event) =>
            onChange({ city: event.target.value as OnboardingDraft["city"] })
          }
        >
          {SHOP_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Adresse"
        htmlFor={addressId}
        hint="L'agent peut la donner aux clients qui veulent passer en boutique."
      >
        <Textarea
          id={addressId}
          rows={3}
          maxLength={TEXT_FIELD_MAX}
          value={draft.address}
          onChange={(event) => onChange({ address: event.target.value })}
        />
      </Field>
      <Field label="Horaires" htmlFor={hoursId}>
        <Input
          id={hoursId}
          maxLength={TEXT_FIELD_MAX}
          placeholder="Lundi au samedi, 9 h à 19 h"
          value={draft.hours}
          onChange={(event) => onChange({ hours: event.target.value })}
        />
      </Field>
    </div>
  );
}
