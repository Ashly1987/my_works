// Vercel serves files in /api as serverless functions. Reuse the Express app
// so every existing /api/* route is available without duplicating handlers.
import { app } from '../functions/api.js';

export default app;
