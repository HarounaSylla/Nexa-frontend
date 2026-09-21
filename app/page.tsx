import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { btnPrimary, btnSecondary, pageTitleClass } from "@/lib/ui";

export default async function Home() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-10 sm:px-6">
      <h1 className={pageTitleClass}>Nexa</h1>
      <p className="text-zinc-500">
        Merchant dashboard for catalogue, orders, conversations, and delivery.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/sign-in" className={btnPrimary}>
          Sign in
        </Link>
        <Link href="/sign-up" className={btnSecondary}>
          Create account
        </Link>
      </div>
    </main>
  );
}
