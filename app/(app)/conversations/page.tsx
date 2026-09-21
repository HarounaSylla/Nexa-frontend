import { auth } from "@clerk/nextjs/server";

import { ConversationsView } from "@/components/conversations/conversations-view";
import { errorMessage } from "@/lib/api";
import {
  type ConversationListItem,
  listConversations,
} from "@/lib/conversations-api";

export default async function ConversationsPage() {
  const { getToken } = await auth.protect();
  const token = await getToken();

  let conversations: ConversationListItem[] = [];
  let initialError: string | null = null;
  try {
    conversations = await listConversations(token);
  } catch (error) {
    initialError = errorMessage(error);
  }

  return (
    <ConversationsView
      initialConversations={conversations}
      initialError={initialError}
    />
  );
}
