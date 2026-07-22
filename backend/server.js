// ================================================================
// FUOTUOKE Campus Eats — Main Express Server
// ================================================================

require("dotenv").config();

const dns  = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const crypto      = require("crypto");
const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const compression = require("compression");
const rateLimit   = require("express-rate-limit");
const connectDB   = require("./config/db");

// ── Route modules ────────────────────────────────────────────────
const authRoutes     = require("./routes/auth");
const menuRoutes     = require("./routes/menu");
const orderRoutes    = require("./routes/orders");
const userRoutes     = require("./routes/users");
const paymentRoutes  = require("./routes/payments");
const settingsRoutes = require("./routes/settings");
const auditRoutes    = require("./routes/audit");

// ── Error handler ────────────────────────────────────────────────
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── Security headers ─────────────────────────────────────────────
app.use(helmet());

// ── Request ID injection ─────────────────────────────────────────
// Attach a unique ID to every incoming request so that logs,
// error reports, and response headers can be correlated.
app.use((req, _res, next) => {
  req.requestId = crypto.randomBytes(8).toString("hex");
  next();
});

// ── Response compression ─────────────────────────────────────────
app.use(compression());

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// ── Global rate limiter ───────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            200,
  message:        { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders:   false
});
app.use("/api", globalLimiter);

// ── Body parsers ──────────────────────────────────────────────────
// Raw body for Paystack webhook signature verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
// JSON for all other routes
app.use(express.json({ limit: "10mb" }));

// ── API routes ────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/menu",     menuRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/audit",    auditRoutes);

// ── Health check ──────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status:    "ok",
    message:   "FUOTUOKE Campus Eats API is running",
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// ── Centralized error handler ─────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 FUOTUOKE Campus Eats API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
});
