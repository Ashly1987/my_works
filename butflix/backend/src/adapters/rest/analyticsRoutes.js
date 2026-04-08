const express = require("express");
const { ok } = require("../../common");

function createAnalyticsRoutes({ analyticsService }) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      const summary = await analyticsService.getSummary();
      res.json(ok(req, summary));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createAnalyticsRoutes };