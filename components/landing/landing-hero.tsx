import { Button } from "@/components/ui/button";

import { JourneyScene } from "./journey-scene";
import { ScenePill } from "./scene-pill";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-[1080px] px-4 pt-6 pb-14 lg:pt-10 lg:pb-[72px]">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_540px] lg:gap-14">
        <div>
          <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[13px] font-medium text-accent-text">
            Pour les commerçants du Sénégal
          </p>
          <h1 className="mt-4 font-display text-[clamp(32px,6vw,52px)] leading-[1.08] font-extrabold tracking-[-0.02em] text-balance text-zinc-900">
            Un commentaire, une conversation, une commande.
          </h1>
          <p className="mt-[18px] max-w-[34em] text-lg text-zinc-500">
            Nexa répond à vos clients sur WhatsApp et sur TikTok, prend leurs
            commandes et les range dans votre tableau de bord. Vous gardez la
            main à chaque étape.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/sign-up" size="lg">
              Créer un compte
            </Button>
            <Button href="#comment-ca-marche" variant="secondary" size="lg">
              Voir comment ça marche
            </Button>
          </div>
          <p className="mt-[18px] flex max-w-[34em] items-start gap-2 text-sm text-zinc-500">
            <ScenePill tone="warning">Bientôt</ScenePill>
            WhatsApp est disponible aujourd&apos;hui. L&apos;intégration TikTok
            arrive dès que TikTok l&apos;aura approuvée.
          </p>
        </div>
        <div className="mx-auto w-full min-w-0 max-w-[540px]">
          <JourneyScene />
        </div>
      </div>
    </section>
  );
}
