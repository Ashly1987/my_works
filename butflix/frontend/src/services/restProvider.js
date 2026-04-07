import { API_BASE } from "./config";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json();
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
};
