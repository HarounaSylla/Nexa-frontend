import { StatusPill } from "@/components/status-pill";

import { isClosed, isEscalated } from "./helpers";

export function ConversationStatusBadge({ status }: { status: string }) {
  if (isEscalated(status)) {
    return <StatusPill tone="warning">Escaladée</StatusPill>;
  }
  if (isClosed(status)) {
    return <StatusPill tone="muted">Fermée</StatusPill>;
  }
  return <StatusPill tone="success">En cours</StatusPill>;
}
