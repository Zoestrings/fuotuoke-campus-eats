// ================================================================
// FUOTUOKE Campus Eats — Audit Log Routes (Admin only)
// GET /api/audit, POST /api/audit
// ================================================================

const express = require("express");
const AuditLog = require("../models/AuditLog");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireRole("admin"));

// ── GET /api/audit — Get all audit logs ──
router.get("/", async (req, res, next) => {
  try {
    const logs = await AuditLog.find();
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// ── POST /api/audit — Manually log an action ──
router.post("/", async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!action) {
      return res.status(400).json({ error: "Action description is required." });
    }

    const log = await AuditLog.create({
      user: req.user.userId,
      action,
      ip: req.ip
    });

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
