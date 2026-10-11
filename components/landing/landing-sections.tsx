import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { PILOT_COPY } from "./journey-steps";

const HOW_IT_WORKS = [
  {
    title: "Il répond à vos clients",
    body: "Sur WhatsApp, et sur TikTok dès l'accès accordé, Nexa répond aux questions sur vos produits, vos prix et vos zones de livraison à partir de votre catalogue.",
  },
  {
    title: "Il prend la commande",
    body: "Produit, taille, ville, mode de paiement : la commande est créée avec les bons articles et le stock est mis à jour.",
  },
  {
    title: "Vous gardez la main",
    body: "Quand une question dépasse l'agent, il vous passe la conversation. Vous répondez depuis le tableau de bord, sur votre téléphone.",
  },
];

const FEATURES = [
  {
    title: "Catalogue avec photos",
    body: "Produits, catégories, prix et stock, gérés depuis votre téléphone.",
  },
  {
    title: "Reconnaît vos produits en photo",
    body: "Un client envoie une photo : l'agent retrouve le produit dans votre catalogue.",
  },
  {
    title: "Commandes et preuves de paiement",
    body: "Vous vérifiez chaque preuve avant de marquer une commande comme payée.",
  },
  {
    title: "Zones de livraison et livreurs",
    body: "Vous fixez les zones, assignez un livreur et suivez la livraison.",
  },
  {
    title: "Notifications en direct",
    body: "Nouvelle commande, conversation à reprendre, produit en rupture.",
  },
  {
    title: "Vous validez sur TikTok",
    body: "Aucune réponse n'est publiée sans votre accord.",
  },
];

export function LandingSections() {
  return (
    <>
      <section
        id="comment-ca-marche"
        className="mx-auto max-w-[1080px] scroll-mt-20 px-4 py-14"
      >
        <p className="text-[13px] font-semibold tracking-[0.06em] text-accent-text uppercase">
          Comment ça marche
        </p>
        <h2 className="mt-2 max-w-[18em] font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight text-zinc-900">
          Vos clients écrivent, l&apos;agent s&apos;occupe du reste.
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <li key={item.title}>
              <Card className="h-full">
                <h3 className="font-display text-lg font-bold text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500">{item.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="fonctionnalites"
        className="mx-auto max-w-[1080px] scroll-mt-20 px-4 py-14"
      >
        <p className="text-[13px] font-semibold tracking-[0.06em] text-accent-text uppercase">
          Pensé pour votre commerce
        </p>
        <h2 className="mt-2 max-w-[18em] font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight text-zinc-900">
          Ce que vous trouvez dans Nexa.
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          {FEATURES.map((item) => (
            <li key={item.title} className="flex gap-3">
              <Check
                className="mt-0.5 size-5 shrink-0 text-success"
                aria-hidden="true"
              />
              <div>
                <p className="font-bold text-zinc-900">{item.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1080px] px-4 py-14">
        <div className="rounded-[20px] bg-accent px-6 py-10 text-center text-white">
          <h2 className="max-w-[16em] font-display text-[clamp(26px,4vw,34px)] font-extrabold tracking-tight">
            Prêt à vendre sans répondre à chaque message ?
          </h2>
          <p className="mx-auto mt-3 max-w-[34em] text-white/85">{PILOT_COPY}</p>
          <Button
            href="/sign-up"
            size="lg"
            variant="secondary"
            className="mt-6 border-0 bg-white text-accent-text hover:bg-zinc-100"
          >
            Créer un compte
          </Button>
        </div>
      </section>
    </>
  );
}
