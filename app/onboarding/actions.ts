"use server";

import { auth } from "@clerk/nextjs/server";

import { errorMessage, onboardMerchant } from "@/lib/api";
import { createProduct } from "@/lib/catalogue-api";
import { saveDeliveryZone } from "@/lib/orders-api";
import { getPreferences, updatePreferences } from "@/lib/preferences-api";

export type OnboardingCommitPayload = {
  preview?: boolean;
  name: string;
  address: string;
  hours: string;
  acceptsCashOnDelivery: boolean;
  acceptsOnlinePayment: boolean;
  zones: { city: string; minHours: number; maxHours: number }[];
  products: {
    name: string;
    price: string;
    category: string;
    stock_qty: number;
  }[];
};

export type OnboardingFailedPart = "preferences" | "zones" | "products";

export type OnboardingCommitResult =
  | { ok: false; error: string }
  | { ok: true; failed: OnboardingFailedPart[] };

export async function completeOnboarding(
  payload: OnboardingCommitPayload,
): Promise<OnboardingCommitResult> {
  const { getToken } = await auth.protect();

  if (process.env.NODE_ENV !== "production" && payload.preview) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok: true, failed: [] };
  }

  const token = await getToken();
  const name = payload.name.trim();
  if (!name) {
    return { ok: false, error: "Le nom de la boutique est requis." };
  }

  try {
    await onboardMerchant(token, name);
  } catch (error) {
    return { ok: false, error: frenchCommitError(error) };
  }

  const failed: OnboardingFailedPart[] = [];

  try {
    const current = await getPreferences(token);
    const address = payload.address.trim();
    const hours = payload.hours.trim();
    const paymentsChanged =
      current.accepts_cash_on_delivery !== payload.acceptsCashOnDelivery ||
      current.accepts_online_payment !== payload.acceptsOnlinePayment;
    if (address || hours || paymentsChanged) {
      await updatePreferences(token, {
        ...current,
        shop_address: address ? address : current.shop_address,
        opening_hours: hours ? hours : current.opening_hours,
        accepts_cash_on_delivery: payload.acceptsCashOnDelivery,
        accepts_online_payment: payload.acceptsOnlinePayment,
      });
    }
  } catch {
    failed.push("preferences");
  }

  let zonesFailed = false;
  for (const zone of payload.zones) {
    try {
      await saveDeliveryZone(token, {
        city: zone.city,
        available: true,
        min_delivery_hours: zone.minHours,
        max_delivery_hours: zone.maxHours,
      });
    } catch {
      zonesFailed = true;
    }
  }
  if (zonesFailed) {
    failed.push("zones");
  }

  let productsFailed = false;
  for (const product of payload.products) {
    try {
      await createProduct(token, {
        name: product.name,
        description: "",
        price: product.price,
        category: product.category,
        stock_qty: product.stock_qty,
      });
    } catch {
      productsFailed = true;
    }
  }
  if (productsFailed) {
    failed.push("products");
  }

  return { ok: true, failed };
}

function frenchCommitError(error: unknown): string {
  const message = errorMessage(error);
  if (message === "Something went wrong. Try again.") {
    return "Impossible de créer la boutique. Réessayez.";
  }
  return message;
}
