const express = require("express");
const { catalogQuerySchema } = require("../../contracts/schemas");
const { ok } = require("../../common");

function createCatalogRoutes({ catalogService }) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      const query = catalogQuerySchema.parse(req.query);
      const result = await catalogService.listCatalog(query);
      res.json(ok(req, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }));
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const item = await catalogService.getContentById(req.params.id);
      res.json(ok(req, item));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createCatalogRoutes };
