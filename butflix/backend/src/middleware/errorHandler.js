function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    requestId: req.requestId,
    error: {
      message,
      details: err.details || null,
    },
  });
}

module.exports = { errorHandler };
