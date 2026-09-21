import { backendFetch } from "@/lib/api";

export type NotificationItem = {
  id: string;
  type: string;
  related_type: string;
  related_id: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export async function listNotifications(token: string | null) {
  return backendFetch<NotificationItem[]>("/notifications", { token });
}

export async function markNotificationRead(
  token: string | null,
  notificationId: string,
) {
  return backendFetch<NotificationItem>(
    `/notifications/${notificationId}/read`,
    { token, method: "POST" },
  );
}

export async function markAllNotificationsRead(token: string | null) {
  return backendFetch<{ updated: number }>("/notifications/read-all", {
    token,
    method: "POST",
  });
}
