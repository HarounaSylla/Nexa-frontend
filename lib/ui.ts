export const focusRingClass =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const motionClass =
  "motion-safe:transition-[background-color,color,box-shadow,opacity,border-color] motion-safe:duration-150";

export const btnPrimary =
  `inline-flex h-11 items-center justify-center rounded-control bg-accent px-4 text-sm font-medium text-white shadow-card hover:bg-accent-text active:bg-accent-text disabled:opacity-60 ${focusRingClass} ${motionClass}`;

export const btnSecondary =
  `inline-flex h-11 items-center justify-center rounded-control border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-accent-soft active:bg-accent-soft disabled:opacity-60 ${focusRingClass} ${motionClass}`;

export const btnDanger =
  `inline-flex h-11 items-center justify-center rounded-control bg-danger px-4 text-sm font-medium text-white shadow-card hover:bg-danger/90 active:bg-danger/90 disabled:opacity-60 ${focusRingClass} ${motionClass}`;

export const btnDangerGhost =
  `inline-flex h-11 items-center justify-center rounded-control px-3 text-sm font-medium text-danger hover:bg-danger-soft disabled:opacity-60 ${focusRingClass} ${motionClass}`;

export const btnWarningOutline =
  `inline-flex h-11 items-center justify-center rounded-control border border-warning bg-white px-4 text-sm font-medium text-warning hover:bg-warning-soft disabled:opacity-60 ${focusRingClass} ${motionClass}`;

export const cardClass =
  "rounded-card border border-zinc-200/80 bg-white shadow-card";

export const cardInteractiveClass =
  `rounded-card border border-zinc-200/80 bg-white shadow-card hover:shadow-card-hover ${motionClass}`;

export const inputClass =
  `h-11 rounded-control border border-zinc-200 bg-white px-3 text-base font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring ${motionClass}`;

export const pageTitleClass = "text-page-title";

export const sectionTitleClass = "text-section-title";

export const bannerErrorClass =
  "rounded-control border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger";

export const bannerSuccessClass =
  "rounded-control border border-success/20 bg-success-soft px-3 py-2 text-sm text-success";

export const bannerInfoClass =
  "rounded-control border border-info/20 bg-info-soft px-3 py-2 text-sm text-info";

export const emptyStateClass =
  "rounded-card border border-zinc-200/80 bg-white px-4 py-10 text-center text-zinc-500 shadow-card sm:px-5";

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
