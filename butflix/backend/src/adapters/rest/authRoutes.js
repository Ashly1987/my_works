const express = require("express");
const { registerSchema, loginSchema } = require("../../contracts/schemas");
const { ok } = require("../../common");

function createAuthRoutes({ identityService }) {
  const router = express.Router();

  router.post("/register", async (req, res, next) => {
    try {
      const input = registerSchema.parse(req.body);
      const session = await identityService.register(input);
      res.status(201).json(ok(req, session));
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const input = loginSchema.parse(req.body);
      const session = await identityService.login(input);
      res.json(ok(req, session));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createAuthRoutes };
