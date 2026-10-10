import type { ConversationMessage } from "@/lib/conversations-api";

const ESCALATION_PREFIX = "[escalade]";

export function isEscalated(status: string): boolean {
  return status === "escalated";
}

export function isClosed(status: string): boolean {
  return status === "closed";
}

export function conversationStatusLabel(status: string): string {
  if (status === "all") {
    return "Toutes";
  }
  if (status === "active") {
    return "En cours";
  }
  if (status === "escalated") {
    return "Escaladée";
  }
  if (status === "closed") {
    return "Fermée";
  }
  return status;
}

export function normalizePhone(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\+/, "")
    .replace(/[\s.\-()]/g, "");
}

export function isEscalationNote(message: ConversationMessage): boolean {
  return (
    message.turn_role === "agent" &&
    message.display_text.trimStart().startsWith(ESCALATION_PREFIX)
  );
}

export function escalationReason(text: string): string {
  const trimmed = text.trimStart();
  if (!trimmed.startsWith(ESCALATION_PREFIX)) {
    return text;
  }
  return trimmed.slice(ESCALATION_PREFIX.length).trim();
}

export function roleLabel(role: string): string {
  if (role === "customer") {
    return "Client";
  }
  if (role === "agent") {
    return "Agent";
  }
  if (role === "merchant") {
    return "Vous";
  }
  return role;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function dayKey(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatListTime(value: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const diffDays = Math.round((today - day) / 86_400_000);
  if (diffDays === 0) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) {
    return "hier";
  }
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatThreadDay(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const diffDays = Math.round((today - day) / 86_400_000);
  if (diffDays === 0) {
    return "Aujourd'hui";
  }
  if (diffDays === 1) {
    return "Hier";
  }
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export function formatBubbleTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
