export const ONBOARDING_STEP_LABELS = [
  "Boutique",
  "WhatsApp",
  "Catalogue",
  "Livraison et paiement",
  "TikTok",
  "Terminé",
] as const;

export const SHOP_CITIES = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Touba",
  "Mbour",
  "Kaolack",
  "Ziguinchor",
  "Autre ville",
] as const;

export type ShopCity = (typeof SHOP_CITIES)[number];

export type DeliveryPreset = {
  city: string;
  minHours: number;
  maxHours: number;
  delayLabel: string;
};

export const DELIVERY_PRESETS: DeliveryPreset[] = [
  { city: "Dakar", minHours: 2, maxHours: 4, delayLabel: "2–4 h" },
  { city: "Pikine", minHours: 3, maxHours: 5, delayLabel: "3–5 h" },
  { city: "Guédiawaye", minHours: 3, maxHours: 5, delayLabel: "3–5 h" },
  { city: "Rufisque", minHours: 4, maxHours: 6, delayLabel: "4–6 h" },
  { city: "Thiès", minHours: 24, maxHours: 48, delayLabel: "24–48 h" },
];

export type OnboardingProductDraft = {
  id: string;
  name: string;
  price: string;
  category: string;
  stock_qty: number;
};

export type OnboardingDraft = {
  step: number;
  name: string;
  city: ShopCity;
  address: string;
  hours: string;
  whatsappNational: string;
  whatsappExistingClients: boolean;
  whatsappRequested: boolean;
  cashOnDelivery: boolean;
  onlinePayment: boolean;
  zoneCities: string[];
  products: OnboardingProductDraft[];
  tiktokNotify: boolean;
};

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  step: 1,
  name: "",
  city: "Dakar",
  address: "",
  hours: "",
  whatsappNational: "",
  whatsappExistingClients: false,
  whatsappRequested: false,
  cashOnDelivery: true,
  onlinePayment: true,
  zoneCities: [],
  products: [],
  tiktokNotify: false,
};

export type OnboardingFailedPart = "preferences" | "zones" | "products";
