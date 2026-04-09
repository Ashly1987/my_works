const { env } = require("./env");

function normalizeOrigins(value) {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .map((origin) => origin.replace(/\/+$/, ""))
    .filter(Boolean);
}

function matchesOrigin(origin, allowedOrigin) {
  if (allowedOrigin === "*") {
    return true;
  }

  if (!allowedOrigin.includes("*")) {
    return origin === allowedOrigin;
  }

  const escaped = allowedOrigin
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  const wildcardRegex = new RegExp(`^${escaped}$`, "i");
  return wildcardRegex.test(origin);
}

const allowedOrigins = normalizeOrigins(env.corsOrigin);

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = String(origin || "").replace(/\/+$/, "");

    if (!origin || allowedOrigins.length === 0) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.some((allowedOrigin) => matchesOrigin(normalizedOrigin, allowedOrigin))) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
};

module.exports = { corsOptions };
