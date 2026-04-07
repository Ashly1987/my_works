function ok(req, data, meta) {
  return {
    success: true,
    requestId: req.requestId,
    data,
    meta: meta || null,
  };
}

module.exports = { ok };
