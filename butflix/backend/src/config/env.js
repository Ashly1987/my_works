const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  corsOrigin:
    process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174",
  dataFile: process.env.DATA_FILE || "./data/db.json",
  externalCatalogEnabled: String(process.env.EXTERNAL_CATALOG_ENABLED || "false") === "true",
  externalCatalogBaseUrl: process.env.EXTERNAL_CATALOG_BASE_URL || "",
  externalCatalogListPath: process.env.EXTERNAL_CATALOG_LIST_PATH || "/api/catalog",
  externalCatalogDetailPath: process.env.EXTERNAL_CATALOG_DETAIL_PATH || "/api/catalog/:id",
  externalCatalogTimeoutMs: Number(process.env.EXTERNAL_CATALOG_TIMEOUT_MS || 4000),
  externalCatalogAuthHeader: process.env.EXTERNAL_CATALOG_AUTH_HEADER || "",
  externalCatalogAuthToken: process.env.EXTERNAL_CATALOG_AUTH_TOKEN || "",
  analyticsDatabaseUrl: process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_URL || "",
};

module.exports = { env };
