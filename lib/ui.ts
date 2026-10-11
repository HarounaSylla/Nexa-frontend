export const focusRingClass =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const bannerErrorClass =
  "rounded-control border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger";

export const bannerInfoClass =
  "rounded-control border border-info/20 bg-info-soft px-3 py-2 text-sm text-info";

export function shopInitial(name: string): string {
  const letter = name.trim().charAt(0);
  return letter ? letter.toLocaleUpperCase("fr-FR") : "?";
}

export function formatDashboardDate(date = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(date)
    .toLocaleLowerCase("fr-FR");
}
