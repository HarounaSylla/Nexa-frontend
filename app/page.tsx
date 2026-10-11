import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingSections } from "@/components/landing/landing-sections";

const title = "Nexa — L'agent WhatsApp des commerçants";
const description =
  "Nexa répond à vos clients sur WhatsApp, prend leurs commandes et les range dans votre tableau de bord.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

export default async function Home() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-col overflow-x-clip bg-background">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingSections />
      </main>
      <LandingFooter />
    </div>
  );
}
