import { ENDPOINTS } from "../api/config";

export async function fetchGoogleNews(symbol) {
  const res = await fetch(ENDPOINTS.GOOGLE_NEWS(symbol), { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch news");
  }

  const data = await res.json();

  // ✅ 后端本来就返回数组
  return Array.isArray(data) ? data : [];
}
