const DELETE_BLOCKED_EN =
  "This product has existing orders and cannot be deleted. Set stock to 0 instead of removing it from the catalogue.";
const DELETE_BLOCKED_FR =
  "Ce produit a des commandes existantes et ne peut pas être supprimé. Mettez le stock à 0 plutôt que de le retirer du catalogue.";

export const UNCATEGORIZED_KEY = "__uncategorized__";

export function formatPrice(price: string | number | null): string {
  if (price == null || price === "") {
    return "Pas de prix";
  }
  const value = typeof price === "number" ? price : Number(price);
  if (Number.isNaN(value)) {
    return String(price);
  }
  return `${value.toLocaleString("fr-FR")} F`;
}

export function displayCatalogueError(message: string): string {
  return message === DELETE_BLOCKED_EN ? DELETE_BLOCKED_FR : message;
}

export function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}
