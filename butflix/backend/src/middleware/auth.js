const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return next({ status: 401, message: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = payload;
    return next();
  } catch (_err) {
    return next({ status: 401, message: "Invalid or expired auth token" });
  }
}

module.exports = { requireAuth };
