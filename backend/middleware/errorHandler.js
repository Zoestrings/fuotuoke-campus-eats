// ================================================================
// FUOTUOKE Campus Eats — Global Error Handler Middleware
// ================================================================

const isDev = process.env.NODE_ENV !== "production";

const errorHandler = (err, req, res, next) => {
  // Always log the full error server-side
  if (isDev) {
    console.error("❌ Error:", err.stack || err.message);
  } else {
    console.error("❌ Error:", err.message);
  }

  // MySQL duplicate entry error
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "A record with that value already exists." });
  }

  // MySQL constraint / bad input error
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

  // Validation errors (custom or library)
  if (err.name === "ValidationError") {
    const messages = err.errors
      ? Object.values(err.errors).map(e => e.message).join(", ")
      : err.message;
    return res.status(400).json({ error: messages });
  }

  // Default: hide internals in production
  const statusCode = err.statusCode || err.status || 500;
  const message = isDev
    ? (err.message || "Internal server error.")
    : statusCode < 500
      ? err.message   // safe to show 4xx messages in production
      : "Internal server error.";

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
