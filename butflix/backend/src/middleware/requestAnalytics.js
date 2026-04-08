function shouldTrackRequest(path) {
  if (!path) {
    return false;
  }

  if (path === "/api/health") {
    return false;
  }

  if (path.startsWith("/api/analytics")) {
    return false;
  }

  return path.startsWith("/api/") || path.startsWith("/mcp/");
}

function getRequestPath(req) {
  const raw = req.originalUrl || req.path || "";
  return raw.split("?")[0];
}

function requestAnalytics(analyticsService) {
  return function analyticsMiddleware(req, res, next) {
    const path = getRequestPath(req);
    res.on("finish", () => {
      if (!shouldTrackRequest(path)) {
        return;
      }

      // Never block or impact API responses because of analytics persistence.
      setImmediate(() => {
        Promise.resolve()
          .then(() => analyticsService.recordRequest())
          .catch((error) => {
            console.error("Failed to persist analytics request", error);
          });
      });
    });

    next();
  };
}

module.exports = { requestAnalytics };