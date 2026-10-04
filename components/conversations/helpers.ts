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
