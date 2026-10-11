export type SceneNodeId = "tt" | "wa" | "db" | "hub";

export type SceneFlow = {
  from: SceneNodeId;
  to: SceneNodeId;
  tone: "accent" | "success";
};

export type JourneyStep = {
  label: string;
  duration: number;
  activeNodes: readonly SceneNodeId[];
  flows: readonly SceneFlow[];
  captionTitle: string;
  captionText: string;
};

export const SCENE_NODES: Record<
  SceneNodeId,
  { x: number; y: number }
> = {
  tt: { x: 50, y: 12 },
  wa: { x: 78.6, y: 61.5 },
  db: { x: 21.4, y: 61.5 },
  hub: { x: 50, y: 45 },
};

export const STAGE_HEIGHT_UNITS = 90;

export function nodeTopPercent(y: number) {
  return (y / STAGE_HEIGHT_UNITS) * 100;
}

export const JOURNEY_STEPS: readonly JourneyStep[] = [
  {
    label: "Commentaire",
    duration: 5400,
    activeNodes: ["tt", "hub"],
    flows: [{ from: "tt", to: "hub", tone: "accent" }],
    captionTitle: "Un client commente votre vidéo",
    captionText:
      "Nexa repère les commentaires qui montrent une intention d'achat.",
  },
  {
    label: "Lien WhatsApp",
    duration: 5200,
    activeNodes: ["hub", "tt"],
    flows: [{ from: "hub", to: "tt", tone: "accent" }],
    captionTitle: "Nexa répond avec un lien WhatsApp",
    captionText: "Vous validez la réponse avant qu'elle soit publiée.",
  },
  {
    label: "Conversation",
    duration: 8200,
    activeNodes: ["hub", "wa"],
    flows: [
      { from: "wa", to: "hub", tone: "success" },
      { from: "hub", to: "wa", tone: "success" },
    ],
    captionTitle: "L'agent prend la commande sur WhatsApp",
    captionText:
      "Il montre le produit, pose les bonnes questions et s'appuie sur votre catalogue.",
  },
  {
    label: "Commande",
    duration: 5200,
    activeNodes: ["hub", "db"],
    flows: [{ from: "hub", to: "db", tone: "accent" }],
    captionTitle: "La commande est créée",
    captionText:
      "Articles, ville, paiement et stock sont enregistrés automatiquement.",
  },
  {
    label: "Tableau de bord",
    duration: 6000,
    activeNodes: ["db"],
    flows: [{ from: "hub", to: "db", tone: "accent" }],
    captionTitle: "Vous la retrouvez dans votre tableau de bord",
    captionText:
      "Notification immédiate, il ne reste qu'à assigner un livreur.",
  },
];

export const PILOT_COPY =
  "Nexa est en phase pilote avec quelques boutiques. Créez votre compte et configurez votre catalogue.";
