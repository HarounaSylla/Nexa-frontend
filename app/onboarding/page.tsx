import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getMerchantMe, MerchantNotOnboardedError } from "@/lib/api";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  const { getToken } = await auth.protect();
  const params = await searchParams;
  const previewRaw = Array.isArray(params.preview)
    ? params.preview[0]
    : params.preview;
  const preview =
    process.env.NODE_ENV !== "production" && previewRaw === "1";

  if (!preview) {
    try {
      await getMerchantMe(await getToken());
      redirect("/dashboard");
    } catch (error) {
      if (!(error instanceof MerchantNotOnboardedError)) {
        throw error;
      }
    }
  }

  return (
    <main className="min-h-full">
      <OnboardingWizard preview={preview} />
    </main>
  );
}
