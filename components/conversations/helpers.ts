import type { ConversationMessage } from "@/lib/conversations-api";

const ESCALATION_PREFIX = "[escalade]";

export function isEscalated(status: string): boolean {
  return status === "escalated";
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
