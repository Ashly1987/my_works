import { API_BASE } from "./config";

async function request(path, options = {}) {
  if (!API_BASE) {
    throw new Error("Missing VITE_API_BASE. Set it to your backend URL.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  if (!contentType.includes("application/json")) {
    const looksLikeHtml = responseText.trimStart().startsWith("<!doctype")
      || responseText.trimStart().startsWith("<html");
    if (looksLikeHtml) {
      throw new Error(
        `Backend returned HTML instead of JSON. Check VITE_API_BASE (current: ${API_BASE}).`
      );
    }
    throw new Error("Backend returned non-JSON response.");
  }

  const payload = JSON.parse(responseText);
  if (!response.ok || payload.success === false) {
    throw new Error(payload?.error?.message || "Request failed");
  }

  return payload;
}

export const restProvider = {
  register: async (input) => {
    const payload = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return payload.data;
  },
  login: async (input) => {
    const payload = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return payload.data;
  },
  listCatalog: async (query = {}) => {
    const params = new URLSearchParams(query);
    const payload = await request(`/api/catalog?${params.toString()}`);
    return { items: payload.data, meta: payload.meta };
  },
  getContentDetail: async (contentId) => {
    const payload = await request(`/api/catalog/${contentId}`);
    return payload.data;
  },
  recordWatchEvent: async ({ token, ...input }) => {
    const payload = await request("/api/activity/watch-events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    return payload.data;
  },
  getHistory: async (token) => {
    const payload = await request("/api/activity/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return payload.data;
  },
  getAnalyticsSummary: async () => {
    const payload = await request("/api/analytics");
    return payload.data;
  },
};
