import { StatusPill } from "@/components/status-pill";

import { isEscalated } from "./helpers";

export function ConversationStatusBadge({ status }: { status: string }) {
  if (isEscalated(status)) {
    return <StatusPill tone="warning">Escaladée</StatusPill>;
  }
  return <StatusPill tone="neutral">En cours</StatusPill>;
}
