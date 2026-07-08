// ================================================================
// FUOTUOKE Campus Eats — Menu Routes
// GET /api/menu, POST, PUT /:id, DELETE /:id
// ================================================================

const express = require("express");
const MenuItem = require("../models/MenuItem");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// ── GET /api/menu — Public: get all menu items ──
router.get("/", async (req, res, next) => {
  try {
    const { cat, search, popular } = req.query;
    const filter = {};

    if (cat && cat !== "All") filter.cat = cat;
    if (popular === "true") filter.popular = true;

    let items = await MenuItem.find(filter);

    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(searchLower));
    }

    res.json(items);
  } catch (error) {
    next(error);
  }
});

// ── GET /api/menu/:id — Public: get single item ──
router.get("/:id", async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Menu item not found." });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// ── POST /api/menu — Vendor/Admin: add menu item ──
router.post("/", authenticate, requireRole("kitchen", "admin"), async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/menu/:id — Vendor/Admin: update menu item ──
router.put("/:id", authenticate, requireRole("kitchen", "admin"), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ error: "Menu item not found." });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/menu/:id — Vendor/Admin: delete menu item ──
router.delete("/:id", authenticate, requireRole("kitchen", "admin"), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Menu item not found." });
    res.json({ success: true, message: "Menu item deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
