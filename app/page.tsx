import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

export default async function Home() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-page-title">Nexa</h1>
      <p className="text-zinc-500">
        Catalogue, commandes, conversations et livraison pour les commerçants
        Nexa.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/sign-in">Se connecter</Button>
        <Button href="/sign-up" variant="secondary">
          Créer un compte
        </Button>
      </div>
    </main>
  );
}
