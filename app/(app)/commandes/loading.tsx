import { pageTitleClass } from "@/lib/ui";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className={pageTitleClass}>Commandes</h1>
      <p className="mt-6 text-sm text-zinc-500">Chargement des commandes…</p>
    </div>
  );
}
