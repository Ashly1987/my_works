const express = require("express");
const { watchEventSchema } = require("../../contracts/schemas");
const { requireAuth } = require("../../middleware/auth");
const { ok } = require("../../common");

function createActivityRoutes({ activityService }) {
  const router = express.Router();

  router.use(requireAuth);

  router.post("/watch-events", (req, res, next) => {
    try {
      const input = watchEventSchema.parse(req.body);
      const event = activityService.recordWatchEvent({
        ...input,
        userId: req.auth.id,
      });
      res.status(201).json(ok(req, event));
    } catch (err) {
      next(err);
    }
  });

  router.get("/history", (req, res, next) => {
    try {
      const history = activityService.getHistoryByUser(req.auth.id);
      res.json(ok(req, history));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createActivityRoutes };
