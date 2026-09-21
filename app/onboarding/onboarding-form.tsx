"use client";

import { useActionState } from "react";

import { bannerErrorClass, btnPrimary, inputClass } from "@/lib/ui";

import { submitOnboarding } from "./actions";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(submitOnboarding, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Shop name
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          autoComplete="organization"
          className={inputClass}
        />
      </label>
      {state?.error ? (
        <p className={bannerErrorClass} role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={btnPrimary}
      >
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
