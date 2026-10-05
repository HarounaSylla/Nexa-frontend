export const btnPrimary =
  "inline-flex h-11 items-center justify-center rounded-control bg-accent px-4 text-sm font-medium text-white shadow-card disabled:opacity-60";

export const btnSecondary =
  "inline-flex h-11 items-center justify-center rounded-control border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 disabled:opacity-60";

export const btnDanger =
  "inline-flex h-11 items-center justify-center rounded-control bg-danger px-4 text-sm font-medium text-white shadow-card disabled:opacity-60";

export const btnDangerGhost =
  "inline-flex h-10 items-center justify-center rounded-control px-3 text-sm font-medium text-danger disabled:opacity-60";

export const btnWarningOutline =
  "inline-flex h-11 items-center justify-center rounded-control border border-warning bg-white px-4 text-sm font-medium text-warning disabled:opacity-60";

export const cardClass =
  "rounded-card border border-zinc-200/80 bg-white shadow-card";

export const cardInteractiveClass =
  "rounded-card border border-zinc-200/80 bg-white shadow-card transition-shadow hover:shadow-card-hover";

export const inputClass =
  "h-11 rounded-control border border-zinc-200 bg-white px-3 text-base font-normal outline-none focus-visible:ring-2 focus-visible:ring-accent";

export const pageTitleClass = "font-display text-2xl font-bold tracking-tight text-zinc-900";

export const sectionTitleClass = "font-display text-base font-bold text-zinc-900";

export const bannerErrorClass =
  "rounded-control border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger";

export const bannerSuccessClass =
  "rounded-control border border-success/20 bg-success-soft px-3 py-2 text-sm text-success";

export const bannerInfoClass =
  "rounded-control border border-info/20 bg-info-soft px-3 py-2 text-sm text-info";

export const emptyStateClass =
  `${cardClass} px-4 py-10 text-center text-zinc-500`;

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
