import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getMerchantMe, MerchantNotOnboardedError } from "@/lib/api";

import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const { getToken } = await auth.protect();

  try {
    await getMerchantMe(await getToken());
    redirect("/dashboard");
  } catch (error) {
    if (!(error instanceof MerchantNotOnboardedError)) {
      throw error;
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
        Set up your shop
      </h1>
      <p className="text-zinc-500">
        Enter the shop name customers will see. You can change more later.
      </p>
      <OnboardingForm />
    </main>
  );
}
