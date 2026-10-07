import { backendFetch } from "@/lib/api";

export type ConversationOrder = {
  id: string;
  order_number: number;
  status: string;
  payment_status: string;
};

export type ConversationListItem = {
  id: string;
  customer_phone: string;
  status: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  message_count: number;
  orders: ConversationOrder[];
};

export type MessageImage = {
  id: string;
  classification: string;
  order_id: string | null;
  detected_amount: string | number | null;
  deleted: boolean;
  match_level?: string | null;
  matched_product_id?: string | null;
  matched_product_name?: string | null;
  match_kind?: "exact" | "similar" | null;
};

export type ConversationMessage = {
  id: string;
  turn_role: string;
  display_text: string;
  created_at: string;
  image: MessageImage | null;
};

export type ConversationStatus = {
  id: string;
  status: string;
};

export async function listConversations(token: string | null) {
  return backendFetch<ConversationListItem[]>("/conversations", { token });
}

export async function getConversation(
  token: string | null,
  conversationId: string,
) {
  return backendFetch<ConversationListItem>(
    `/conversations/${conversationId}`,
    { token },
  );
}

export async function listConversationMessages(
  token: string | null,
  conversationId: string,
) {
  return backendFetch<ConversationMessage[]>(
    `/conversations/${conversationId}/messages`,
    { token },
  );
}

export async function replyToConversation(
  token: string | null,
  conversationId: string,
  message: string,
) {
  return backendFetch<ConversationMessage>(
    `/conversations/${conversationId}/reply`,
    {
      token,
      method: "POST",
      body: JSON.stringify({ message }),
    },
  );
}

export async function returnConversationToAgent(
  token: string | null,
  conversationId: string,
) {
  return backendFetch<ConversationStatus>(
    `/conversations/${conversationId}/return-to-agent`,
    { token, method: "POST" },
  );
}
