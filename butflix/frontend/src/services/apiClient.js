import { PROVIDER_MODE } from "./config";
import { restProvider } from "./restProvider";
import { mcpProvider } from "./mcpProvider";

export const apiClient = PROVIDER_MODE === "mcp" ? mcpProvider : restProvider;
