// Main Express Server Configuration

require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");
const settingsRoutes = require("./routes/settings");
const auditRoutes = require("./routes/audit");

// Import error handler
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security config
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});
app.use("/api/auth", limiter);

// Parse incoming request bodies
// Raw body for Paystack webhook signature verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
// JSON parser for all other routes
app.use(express.json({ limit: "10mb" }));

// Register API route endpoints
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/audit", auditRoutes);

// Basic health status checks
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FUOTUOKE Campus Eats API is running" });
});

// Centralized error handling wrapper
app.use(errorHandler);

// Bind port and start app listener
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 FUOTUOKE Campus Eats API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
});
