import { backendFetch } from "@/lib/api";

export type ConversationListItem = {
  id: string;
  customer_phone: string;
  status: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  message_count: number;
};

export type ConversationMessage = {
  id: string;
  turn_role: string;
  display_text: string;
  created_at: string;
};

export type ConversationStatus = {
  id: string;
  status: string;
};

export async function listConversations(token: string | null) {
  return backendFetch<ConversationListItem[]>("/conversations", { token });
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
