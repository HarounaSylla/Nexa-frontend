"use client";

export function PageTabs({
  label,
  tabs,
  selectedId,
  onSelect,
}: {
  label: string;
  tabs: readonly { id: string; label: string }[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const activeId = selectedId ?? tabs[0]?.id;

  return (
    <div
      role="tablist"
      aria-label={label}
      className="mt-4 flex gap-1 overflow-x-auto border-b border-zinc-200"
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect?.(tab.id)}
            className={`shrink-0 border-b-2 px-3 py-2 font-display text-sm font-semibold ${
              selected
                ? "border-accent text-accent-text"
                : "border-transparent text-zinc-500"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
