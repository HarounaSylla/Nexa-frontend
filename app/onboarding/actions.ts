"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { onboardMerchant } from "@/lib/api";

export async function submitOnboarding(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const { getToken } = await auth.protect();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Shop name is required." };
  }

  await onboardMerchant(await getToken(), name);
  redirect("/dashboard");
}
