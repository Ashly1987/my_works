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

function requestAnalytics(analyticsService) {
  return function analyticsMiddleware(req, res, next) {
    res.on("finish", () => {
      if (!shouldTrackRequest(req.path)) {
        return;
      }

      Promise.resolve(analyticsService.recordRequest()).catch((error) => {
        console.error("Failed to persist analytics request", error);
      });
    });

    next();
  };
}

module.exports = { requestAnalytics };