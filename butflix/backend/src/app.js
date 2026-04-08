const express = require("express");
const cors = require("cors");
const { corsOptions } = require("./config/corsOptions");
const { env } = require("./config/env");
const { createStore } = require("./data/store");
const { requestId } = require("./middleware/requestId");
const { requestAnalytics } = require("./middleware/requestAnalytics");
const { errorHandler } = require("./middleware/errorHandler");
const { createAnalyticsService } = require("./domain/analytics/service");
const { createIdentityService } = require("./domain/identity/service");
const { createCatalogService } = require("./domain/catalog/service");
const { createActivityService } = require("./domain/activity/service");
const { createExternalCatalogSource } = require("./integrations/externalCatalogSource");
const { createPostgresAnalyticsRepository } = require("./integrations/postgresAnalyticsRepository");
const { createAnalyticsRoutes } = require("./adapters/rest/analyticsRoutes");
const { createAuthRoutes } = require("./adapters/rest/authRoutes");
const { createCatalogRoutes } = require("./adapters/rest/catalogRoutes");
const { createActivityRoutes } = require("./adapters/rest/activityRoutes");
const { createMcpRouter } = require("./adapters/mcp/router");

function createApp() {
  const app = express();
  const store = createStore(env.dataFile);
  const analyticsRepository = env.analyticsDatabaseUrl
    ? createPostgresAnalyticsRepository({ connectionString: env.analyticsDatabaseUrl })
    : null;

  const externalCatalogSource =
    env.externalCatalogEnabled && env.externalCatalogBaseUrl
      ? createExternalCatalogSource({
          baseUrl: env.externalCatalogBaseUrl,
          listPath: env.externalCatalogListPath,
          detailPath: env.externalCatalogDetailPath,
          timeoutMs: env.externalCatalogTimeoutMs,
          authHeader: env.externalCatalogAuthHeader,
          authToken: env.externalCatalogAuthToken,
        })
      : null;

  const services = {
    analyticsService: createAnalyticsService(store, {
      repository: analyticsRepository,
    }),
    identityService: createIdentityService(store),
    catalogService: createCatalogService(store, { externalSource: externalCatalogSource }),
    activityService: createActivityService(store),
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(requestId);
  app.use(requestAnalytics(services.analyticsService));

  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      requestId: req.requestId,
      data: { status: "ok" },
    });
  });

  app.use("/api/auth", createAuthRoutes(services));
  app.use("/api/analytics", createAnalyticsRoutes(services));
  app.use("/api/catalog", createCatalogRoutes(services));
  app.use("/api/activity", createActivityRoutes(services));
  app.use("/mcp", createMcpRouter(services));

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
