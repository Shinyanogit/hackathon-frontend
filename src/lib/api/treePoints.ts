import { apiClient } from "@/lib/apiClient";

export async function fetchTreePoints() {
  return apiClient.get<{ total: number; balance: number }>("/me/tree-points");
}

export async function spendTreePoints(points: number) {
  return apiClient.post<{ total: number; balance: number }>("/me/tree-points/spend", { points });
}
