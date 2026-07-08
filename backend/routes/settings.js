// ================================================================
// FUOTUOKE Campus Eats — Settings Routes (Admin only)
// GET /api/settings, PUT /api/settings
// ================================================================

const express = require("express");
const Settings = require("../models/Settings");
const AuditLog = require("../models/AuditLog");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireRole("admin"));

// ── GET /api/settings — Get system settings ──
router.get("/", async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/settings — Update system settings ──
router.put("/", async (req, res, next) => {
  try {
    const { maintenanceMode, allowRegistration, allowDeliveries, deliveryFee, supportPhone } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowRegistration !== undefined) settings.allowRegistration = allowRegistration;
    if (allowDeliveries !== undefined) settings.allowDeliveries = allowDeliveries;
    if (deliveryFee !== undefined) settings.deliveryFee = deliveryFee;
    if (supportPhone !== undefined) settings.supportPhone = supportPhone;

    await settings.save();

    // Audit log
    await AuditLog.create({
      user: req.user.userId,
      action: "Updated system settings",
      ip: req.ip
    });

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
