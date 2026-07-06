// ================================================================
// FUOTUOKE Campus Eats — Order Routes
// GET /api/orders, POST, PATCH /:id/status, DELETE /:id
// ================================================================

const express = require("express");
const Order = require("../models/Order");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// ── GET /api/orders — Role-filtered order list ──
router.get("/", authenticate, async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === "student" || req.user.role === "staff") {
      // Customers see only their own orders
      filter.customerId = req.user.userId;
    } else if (req.user.role === "kitchen") {
      // Vendors see orders for their canteen
      if (req.user.canteen) {
        filter["outlet.name"] = req.user.canteen;
      }
    }
    // Admin sees all orders (no filter)

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// ── GET /api/orders/:id — Get single order ──
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    // Customers can only view their own orders
    if (
      (req.user.role === "student" || req.user.role === "staff") &&
      order.customerId !== req.user.userId
    ) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// ── POST /api/orders — Customer: place new order ──
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { items, total, outlet, type, faculty } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }
    if (!outlet || !outlet.name) {
      return res.status(400).json({ error: "Please select a canteen." });
    }
    if (type === "delivery" && !faculty) {
      return res.status(400).json({ error: "Please select a faculty for delivery." });
    }

    const order = await Order.create({
      items,
      total,
      outlet,
      type,
      faculty: type === "delivery" ? faculty : null,
      status: "Received",
      customerId: req.user.userId,
      customerName: req.user.name,
      paymentStatus: "pending"
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/orders/:id/status — Vendor/Admin: update order status ──
router.patch("/:id/status", authenticate, requireRole("kitchen", "admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Received", "Preparing", "Ready", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found." });

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/orders/:id — Admin: delete order ──
router.delete("/:id", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json({ success: true, message: "Order deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
