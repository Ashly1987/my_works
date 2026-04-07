const crypto = require("node:crypto");

function requestId(req, _res, next) {
  req.requestId = crypto.randomUUID();
  next();
}

module.exports = { requestId };
