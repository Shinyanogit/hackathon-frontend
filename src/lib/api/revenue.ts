import { apiClient } from "@/lib/apiClient";

export async function fetchRevenue() {
  return apiClient.get<{ revenueYen: number }>("/me/revenue");
}

export async function withdrawRevenue(amountYen: number) {
  return apiClient.post<{ revenueYen: number }>("/me/revenue/withdraw", { amountYen });
}
