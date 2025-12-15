import { apiClient } from "@/lib/apiClient";

export async function askItemWithGemini(itemId: number | string, question: string) {
  return apiClient.post<{ answer: string }>(`/items/${itemId}/ask`, { question });
}
