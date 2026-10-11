"use client";

import { useActionState, useId } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { bannerErrorClass } from "@/lib/ui";

import { submitOnboarding } from "./actions";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(submitOnboarding, null);
  const nameId = useId();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nom de la boutique" htmlFor={nameId}>
        <Input
          id={nameId}
          name="name"
          type="text"
          required
          maxLength={200}
          autoComplete="organization"
        />
      </Field>
      {state?.error ? (
        <p className={bannerErrorClass} role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Continuer"}
      </Button>
    </form>
  );
}
