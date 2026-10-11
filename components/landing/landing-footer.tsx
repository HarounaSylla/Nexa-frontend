import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200/80">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-3 px-4 pt-7 pb-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">© DigiLabs, Sénégal</p>
        <nav aria-label="Pied de page" className="flex flex-wrap gap-x-5 gap-y-2">
          <a
            href="https://digilabs.sn/confidentialite.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Confidentialité
          </a>
          <a
            href="https://digilabs.sn/conditions.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Conditions
          </a>
          <Link href="/sign-in" className="text-sm text-zinc-600 hover:text-zinc-900">
            Se connecter
          </Link>
        </nav>
      </div>
    </footer>
  );
}
