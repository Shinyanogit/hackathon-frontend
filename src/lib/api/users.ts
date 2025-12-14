import { apiClient } from "@/lib/apiClient";

export type PublicUser = {
  uid: string;
  displayName: string;
  photoURL?: string | null;
};

export async function fetchPublicUser(uid: string) {
  return apiClient.get<PublicUser>(`/users/${uid}/public`);
}
