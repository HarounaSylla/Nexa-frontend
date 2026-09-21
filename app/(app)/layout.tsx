import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getMerchantMe, MerchantNotOnboardedError } from "@/lib/api";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = await auth.protect();
  const token = await getToken();

  let merchant;
  try {
    merchant = await getMerchantMe(token);
  } catch (error) {
    if (error instanceof MerchantNotOnboardedError) {
      redirect("/onboarding");
    }
    throw error;
  }

  return <AppShell shopName={merchant.name}>{children}</AppShell>;
}
