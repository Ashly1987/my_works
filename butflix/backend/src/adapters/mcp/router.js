const express = require("express");

function createMcpRouter({ identityService, catalogService, activityService }) {
  const router = express.Router();

  const tools = {
    "identity.register": async ({ email, password }) => identityService.register({ email, password }),
    "identity.login": async ({ email, password }) => identityService.login({ email, password }),
    "identity.validateSession": async ({ token }) => identityService.validateSession(token),
    "catalog.list": async ({ search, genre, page = 1, limit = 12 }) =>
      catalogService.listCatalog({ search, genre, page, limit }),
    "catalog.detail": async ({ contentId }) => catalogService.getContentById(contentId),
    "activity.recordWatchEvent": async ({ token, contentId, eventType, positionSec = 0 }) => {
      const session = identityService.validateSession(token);
      if (!session.valid) {
        throw { status: 401, message: "Invalid or expired auth token" };
      }

      return activityService.recordWatchEvent({
        userId: session.user.id,
        contentId,
        eventType,
        positionSec,
      });
    },
    "activity.getHistory": async ({ token }) => {
      const session = identityService.validateSession(token);
      if (!session.valid) {
        throw { status: 401, message: "Invalid or expired auth token" };
      }

      return activityService.getHistoryByUser(session.user.id);
    },
  };

  router.post("/tools/call", async (req, res, next) => {
    try {
      const { tool, input } = req.body;
      if (!tool || typeof tool !== "string") {
        throw { status: 400, message: "Missing tool name" };
      }

      const handler = tools[tool];
      if (!handler) {
        throw { status: 404, message: `Unknown tool: ${tool}` };
      }

      const data = await handler(input || {});
      res.json({
        success: true,
        requestId: req.requestId,
        data,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createMcpRouter };
