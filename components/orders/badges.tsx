import { StatusPill } from "@/components/status-pill";

import { formatEnum } from "./order-helpers";

type Tone = "neutral" | "info" | "success" | "danger" | "warning";

function statusTone(status: string): Tone {
  if (status === "delivered") {
    return "success";
  }
  if (status === "cancelled") {
    return "danger";
  }
  if (status === "deliverer_assigned") {
    return "info";
  }
  if (status === "created") {
    return "warning";
  }
  return "neutral";
}

function paymentTone(status: string): Tone {
  if (status === "paid") {
    return "success";
  }
  if (status === "proof_received") {
    return "info";
  }
  if (status === "pending") {
    return "warning";
  }
  return "neutral";
}

export function StatusBadge({ status }: { status: string }) {
  return <StatusPill tone={statusTone(status)}>{formatEnum(status)}</StatusPill>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return <StatusPill tone={paymentTone(status)}>{formatEnum(status)}</StatusPill>;
}
