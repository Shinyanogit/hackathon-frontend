import { apiClient } from "@/lib/apiClient";
import { Notification } from "@/types/notification";

export async function fetchNotifications(params?: { unreadOnly?: boolean; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.unreadOnly === false) search.set("unread_only", "false");
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const path = qs ? `/me/notifications?${qs}` : "/me/notifications";
  return apiClient.get<{ notifications: Notification[]; unreadCount: number }>(path);
}

export async function markAllNotificationsRead() {
  return apiClient.post<{ status: string }>("/me/notifications/read-all");
}
