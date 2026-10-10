export function DateSeparator({ label }: { label: string }) {
  return (
    <li className="flex justify-center py-1">
      <span className="rounded-full bg-white px-2.5 py-0.5 text-caption font-medium text-zinc-500 shadow-card">
        {label}
      </span>
    </li>
  );
}
