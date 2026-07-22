// ================================================================
// FUOTUOKE Campus Eats — Global Error Handler Middleware
//
// Logs: timestamp, requestId, method, route, IP, userId, status code.
// Development: includes full stack trace in server logs.
// Production:  5xx messages are never exposed to the client.
// ================================================================

const IS_DEV = process.env.NODE_ENV !== "production";

const errorHandler = (err, req, res, next) => {
  // Gather rich context for structured logging
  const requestId = req.requestId || "unknown";
  const method    = req.method    || "-";
  const route     = req.originalUrl || req.url || "-";
  const ip        = req.ip        || req.socket?.remoteAddress || "-";
  const userId    = req.user?.userId || req.user?.id || "anonymous";
  const timestamp = new Date().toISOString();

  // Determine HTTP status code
  const statusCode = err.statusCode || err.status || 500;

  // ── Server-side structured log ─────────────────────────────────
  const logPayload = {
    timestamp,
    requestId,
    level:  statusCode >= 500 ? "ERROR" : "WARN",
    method,
    route,
    ip,
    userId,
    statusCode,
    errorName:    err.name    || "Error",
    errorMessage: err.message || "Unknown error",
    ...(err.code ? { errorCode: err.code } : {})
  };

  if (IS_DEV) {
    // Full stack trace in development for rapid debugging
    logPayload.stack = err.stack;
    console.error("❌ Error:", JSON.stringify(logPayload, null, 2));
  } else {
    // Concise one-liner in production (no stack trace leaked)
    console.error(
      `❌ [${timestamp}] ${logPayload.level} req=${requestId} ` +
      `${method} ${route} ip=${ip} user=${userId} ` +
      `status=${statusCode} err="${err.message}"`
    );
  }

  // Attach request ID to response so clients / logs can correlate
  res.setHeader("X-Request-Id", requestId);

  // ── Known error types ──────────────────────────────────────────

  // MySQL duplicate entry
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "A record with that value already exists." });
  }

  // MySQL bad field / parse errors
  if (err.code === "ER_BAD_FIELD_ERROR" || err.code === "ER_PARSE_ERROR") {
    return res.status(400).json({ error: "Invalid query. Please check your input." });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired. Please login again." });
  }

  // Validation errors (custom or library-generated)
  if (err.name === "ValidationError") {
    const messages = err.errors
      ? Object.values(err.errors).map((e) => e.message).join(", ")
      : err.message;
    return res.status(400).json({ error: messages });
  }

  // ── Default response ───────────────────────────────────────────
  // 4xx messages are safe to surface — they describe client errors.
  // 5xx messages are hidden in production to avoid leaking internals.
  const clientMessage = IS_DEV
    ? err.message || "Internal server error."
    : statusCode < 500
      ? err.message
      : "Internal server error.";

  res.status(statusCode).json({ error: clientMessage });
};

module.exports = errorHandler;
