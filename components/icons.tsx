import {
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import type { NavIconName } from "@/lib/nav";

type IconProps = {
  className?: string;
};

const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  catalogue: ShoppingBag,
  orders: Package,
  conversations: MessageCircle,
  settings: Settings,
};

export function NavIcon({
  name,
  className,
}: {
  name: NavIconName;
  className?: string;
}) {
  const Icon = NAV_ICONS[name];
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.45 1.34 4.95L2 22l5.38-1.41a10 10 0 0 0 4.66 1.18h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.19.84.85-3.11-.2-.32a8.13 8.13 0 0 1-1.25-4.35c0-4.5 3.69-8.16 8.23-8.16 4.54 0 8.23 3.66 8.23 8.16 0 4.5-3.69 8.27-8.18 8.27Zm4.51-6.19c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.15.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74 2.49 1.07 2.49.71 2.94.67.45-.04 1.46-.6 1.67-1.17.21-.58.21-1.07.15-1.17-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M14.5 3c.3 2.3 1.6 3.8 3.8 4v2.5c-1.3.13-2.5-.2-3.8-.9v6.3c0 3.2-2.2 5.3-5.3 5.3S4 18.1 4 14.9c0-3.1 2.3-5.2 5.3-5.2.4 0 .9.05 1.3.16v2.63a2.7 2.7 0 0 0-1.3-.33c-1.5 0-2.6 1.2-2.6 2.74 0 1.53 1.1 2.74 2.6 2.74 1.6 0 2.7-1.1 2.7-2.8V3h2.5Z" />
    </svg>
  );
}

function Svg({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PhotoPlaceholderIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m21 16-5-4-4 3-3-2-6 5" />
    </Svg>
  );
}
