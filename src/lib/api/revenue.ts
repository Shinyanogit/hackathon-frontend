import { apiClient } from "@/lib/apiClient";

export async function fetchRevenue() {
  return apiClient.get<{ revenueCents: number }>("/me/revenue");
}

export async function withdrawRevenue(amountCents: number) {
  return apiClient.post<{ revenueCents: number }>("/me/revenue/withdraw", { amountCents });
}
