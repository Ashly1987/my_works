const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = registerSchema;

const catalogQuerySchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(25),
});

const watchEventSchema = z.object({
  contentId: z.string().min(1),
  eventType: z.enum(["start", "progress", "complete"]),
  positionSec: z.number().min(0).default(0),
});

module.exports = {
  registerSchema,
  loginSchema,
  catalogQuerySchema,
  watchEventSchema,
};
