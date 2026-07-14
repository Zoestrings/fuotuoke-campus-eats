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
        filter.outletName = req.user.canteen;
      }
    } else if (req.user.role === "rider") {
      // Riders see delivery orders that are ready/preparing or assigned to them
      filter.isRiderQuery = true;
      filter.riderId = req.user.userId;
    }
    // Admin sees all orders (no filter)

    const orders = await Order.find(filter);
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
    const { items, total, outlet, type, faculty, latitude, longitude, formattedAddress, deliveryNotes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }
    if (!outlet || !outlet.name) {
      return res.status(400).json({ error: "Please select a canteen." });
    }
    if (type === "delivery") {
      if (!faculty) {
        return res.status(400).json({ error: "Please select a faculty for delivery." });
      }
      if (!formattedAddress || !formattedAddress.trim()) {
        return res.status(400).json({ error: "Please provide your delivery address." });
      }
    }

    const order = await Order.create({
      items,
      total,
      outlet,
      type,
      faculty: type === "delivery" ? faculty : null,
      latitude: type === "delivery" ? latitude : null,
      longitude: type === "delivery" ? longitude : null,
      formattedAddress: type === "delivery" ? formattedAddress : null,
      deliveryNotes: type === "delivery" ? deliveryNotes : null,
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

// ── PATCH /api/orders/:id/accept-delivery — Rider: accept delivery ──
router.patch("/:id/accept-delivery", authenticate, requireRole("rider"), async (req, res, next) => {
  try {
    const { phone } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    if (order.type !== "delivery") {
      return res.status(400).json({ error: "This is a pickup order, cannot be delivered." });
    }

    if (order.assignedRiderId) {
      return res.status(400).json({ error: "This order has already been accepted by another rider." });
    }

    order.assignedRiderId = req.user.userId;
    order.assignedRiderName = req.user.name;
    order.assignedRiderPhone = phone || "08012345678";
    order.status = "Out for Delivery";
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/orders/:id/complete-delivery — Rider: complete delivery ──
router.patch("/:id/complete-delivery", authenticate, requireRole("rider"), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    if (order.assignedRiderId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied. You are not the assigned rider for this order." });
    }

    order.status = "Completed";
    order.deliveryProgress = 100;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/orders/:id/delivery-progress — Rider: update delivery progress ──
router.patch("/:id/delivery-progress", authenticate, requireRole("rider"), async (req, res, next) => {
  try {
    const { progress } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    if (order.assignedRiderId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied. You are not the assigned rider for this order." });
    }

    order.deliveryProgress = Number(progress);
    if (Number(progress) >= 100) {
      order.status = "Completed";
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/orders/:id/location — Rider: update GPS coordinates ──
router.patch("/:id/location", authenticate, requireRole("rider"), async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    if (order.assignedRiderId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied. You are not the assigned rider for this order." });
    }

    order.riderLatitude = Number(latitude);
    order.riderLongitude = Number(longitude);

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/orders/:id/review — Customer: submit order rating and review ──
router.patch("/:id/review", authenticate, async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    // Ensure this customer placed the order
    if (order.customerId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied. You can only review your own orders." });
    }

    order.rating = Number(rating);
    order.review = (review || "").trim();
    
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
