"use client";

import {
  useCallback,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  DEFAULT_ONBOARDING_DRAFT,
  SHOP_CITIES,
  type OnboardingDraft,
  type ShopCity,
} from "./onboarding-types";

const STORAGE_KEY = "nexa.onboarding.draft.v1";

function isShopCity(value: unknown): value is ShopCity {
  return (
    typeof value === "string" &&
    (SHOP_CITIES as readonly string[]).includes(value)
  );
}

function parseDraft(raw: unknown): OnboardingDraft | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const value = raw as Partial<OnboardingDraft>;
  const step =
    typeof value.step === "number" && value.step >= 1 && value.step <= 5
      ? value.step
      : 1;
  return {
    ...DEFAULT_ONBOARDING_DRAFT,
    ...value,
    step,
    city: isShopCity(value.city) ? value.city : DEFAULT_ONBOARDING_DRAFT.city,
    zoneCities: Array.isArray(value.zoneCities)
      ? value.zoneCities.filter((city): city is string => typeof city === "string")
      : [],
    products: Array.isArray(value.products) ? value.products : [],
  };
}

let cachedRaw: string | null | undefined;
let cachedDraft: OnboardingDraft = DEFAULT_ONBOARDING_DRAFT;

function readSnapshot(): OnboardingDraft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedDraft;
    }
    cachedRaw = raw;
    cachedDraft = raw
      ? (parseDraft(JSON.parse(raw)) ?? DEFAULT_ONBOARDING_DRAFT)
      : DEFAULT_ONBOARDING_DRAFT;
    return cachedDraft;
  } catch {
    return DEFAULT_ONBOARDING_DRAFT;
  }
}

function subscribe(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      onStoreChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function persistDraft(draft: OnboardingDraft): void {
  try {
    if (draft.step === 6) {
      sessionStorage.removeItem(STORAGE_KEY);
      cachedRaw = null;
      cachedDraft = DEFAULT_ONBOARDING_DRAFT;
      return;
    }
    const raw = JSON.stringify(draft);
    sessionStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedDraft = draft;
  } catch {
    // Private mode / quota — the page must still work.
  }
}

export function useOnboardingDraft(): {
  draft: OnboardingDraft;
  setDraft: Dispatch<SetStateAction<OnboardingDraft>>;
} {
  const persisted = useSyncExternalStore(
    subscribe,
    readSnapshot,
    () => DEFAULT_ONBOARDING_DRAFT,
  );
  const [override, setOverride] = useState<OnboardingDraft | null>(null);
  const draft = override ?? persisted;

  const setDraft = useCallback<Dispatch<SetStateAction<OnboardingDraft>>>(
    (update) => {
      setOverride((current) => {
        const base = current ?? persisted;
        const next = typeof update === "function" ? update(base) : update;
        persistDraft(next);
        return next;
      });
    },
    [persisted],
  );

  return { draft, setDraft };
}
