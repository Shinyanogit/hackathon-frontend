import { ApiError, apiBaseURL, apiClient } from "@/lib/apiClient";
import { auth } from "@/lib/firebase";

export type EnhanceImageResponse = {
  originalUrl: string;
  enhancedUrl: string;
  meta: {
    mode: "fashion-look" | "tech-gadget" | "outdoor-gear";
    strength: number;
    background: "white" | "light_gray" | "original";
    elapsedMs: number;
  };
};

export async function enhanceImage(params: {
  image: File;
  itemId?: string;
  category?: string;
  mode?: "auto" | "fashion-look" | "tech-gadget" | "outdoor-gear";
  strength?: number;
  background?: "white" | "light_gray" | "original";
}): Promise<EnhanceImageResponse> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("AI補正を使うにはログインが必要です");
  }
  const token = await user.getIdToken();
  const form = new FormData();
  form.append("image", params.image);
  if (params.itemId) form.append("itemId", params.itemId);
  if (params.category) form.append("category", params.category);
  if (params.mode) form.append("mode", params.mode);
  if (typeof params.strength === "number") form.append("strength", String(params.strength));
  if (params.background) form.append("background", params.background);

  const res = await fetch(`${apiBaseURL}/ai/image-enhance`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[enhanceImage] request failed", { status: res.status, body: text || res.statusText });
    // try refresh once on 401
    if (res.status === 401) {
      const fresh = await user.getIdToken(true);
      const retry = await fetch(`${apiBaseURL}/ai/image-enhance`, {
        method: "POST",
        headers: { Authorization: `Bearer ${fresh}` },
        body: form,
      });
      if (!retry.ok) {
        const retryText = await retry.text();
        console.error("[enhanceImage] retry failed", { status: retry.status, body: retryText || retry.statusText });
        throw new ApiError(retry.status, retryText || retry.statusText);
      }
      const retryData = (await retry.json()) as EnhanceImageResponse;
      console.info("[enhanceImage] retry success", {
        mode: retryData.meta?.mode,
        background: retryData.meta?.background,
        strength: retryData.meta?.strength,
        elapsedMs: retryData.meta?.elapsedMs,
      });
      return retryData;
    }
    throw new ApiError(res.status, text || res.statusText);
  }

  const data = (await res.json()) as EnhanceImageResponse;
  console.info("[enhanceImage] success", {
    mode: data.meta?.mode,
    background: data.meta?.background,
    strength: data.meta?.strength,
    elapsedMs: data.meta?.elapsedMs,
  });
  return data;
}

export async function askItemWithGemini(itemId: number | string, question: string): Promise<{ answer: string }> {
  return apiClient.post(`/items/${itemId}/ask`, { question });
}
