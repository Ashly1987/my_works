import { API_BASE } from "./config";

async function callTool(tool, input = {}) {
  const response = await fetch(`${API_BASE}/mcp/tools/call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tool, input }),
  });

  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(payload?.error?.message || "Tool call failed");
  }

  return payload.data;
}

export const mcpProvider = {
  register: async (input) => callTool("identity.register", input),
  login: async (input) => callTool("identity.login", input),
  listCatalog: async (query = {}) => {
    const result = await callTool("catalog.list", query);
    return {
      items: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  },
  getContentDetail: async (contentId) => callTool("catalog.detail", { contentId }),
  getAnalyticsSummary: async () => callTool("analytics.getSummary"),
  recordWatchEvent: async ({ token, ...input }) =>
    callTool("activity.recordWatchEvent", {
      token,
      ...input,
    }),
  getHistory: async (token) => callTool("activity.getHistory", { token }),
};
