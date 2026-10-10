export type NavIconName =
  | "dashboard"
  | "catalogue"
  | "orders"
  | "conversations"
  | "settings";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: NavIconName;
};

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    shortLabel: "Accueil",
    icon: "dashboard",
  },
  {
    href: "/catalogue",
    label: "Catalogue",
    shortLabel: "Catalogue",
    icon: "catalogue",
  },
  {
    href: "/commandes",
    label: "Commandes",
    shortLabel: "Commandes",
    icon: "orders",
  },
  {
    href: "/conversations",
    label: "Conversations",
    shortLabel: "Messages",
    icon: "conversations",
  },
  {
    href: "/parametres",
    label: "Paramètres",
    shortLabel: "Paramètres",
    icon: "settings",
  },
];

export const CATALOGUE_TABS = [
  { id: "produits", label: "Produits" },
  { id: "categories", label: "Catégories" },
] as const;

// Préférences is where the merchant configures what the WhatsApp
// orchestrator needs in order to behave correctly. Delivery zones are
// the first example; later items (accepted payment methods, response
// tone, thresholds) will likely land here too. This is not generic
// shop-profile settings — those belong on a later Général tab.
export const PARAMETRES_TABS = [
  { id: "preferences", label: "Préférences" },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isAppPath(pathname: string): boolean {
  return NAV_ITEMS.some((item) => isActivePath(pathname, item.href));
}
