// ================================================================
// FUOTUOKE Campus Eats — Payment Routes (Paystack Integration)
// POST /api/payments/initialize, /webhook, GET /verify/:ref, GET /
// ================================================================

const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");
const AuditLog = require("../models/AuditLog");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// ── POST /api/payments/initialize — Start a Paystack transaction ──
router.post("/initialize", authenticate, async (req, res, next) => {
  try {
    const { orderId, email, amount, callbackUrl } = req.body;

    if (!orderId || !email || !amount) {
      return res.status(400).json({ error: "orderId, email, and amount are required." });
    }

    // Verify the order exists and belongs to the user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    if (order.customerId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    // Check if we should run in Sandbox / Mock mode (when key is a placeholder or not provided)
    const isMockMode = !PAYSTACK_SECRET || PAYSTACK_SECRET.includes("xxxx") || PAYSTACK_SECRET.trim() === "";
    if (isMockMode) {
      const mockRef = `MOCK-FUO-${orderId}-${Date.now()}`;
      order.paymentRef = mockRef;
      await order.save();

      return res.json({
        success: true,
        authorization_url: `${callbackUrl || `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/callback`}?reference=${mockRef}`,
        reference: mockRef,
        isMock: true
      });
    }

    // Initialize Paystack transaction
    // Amount is in kobo (₦1 = 100 kobo)
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference: `FUO-${orderId}-${Date.now()}`,
        callback_url: callbackUrl || `${process.env.CLIENT_URL}/payment/callback`,
        metadata: {
          orderId,
          customerId: req.user.userId,
          customerName: req.user.name
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.status) {
      // Save payment reference to order
      order.paymentRef = response.data.data.reference;
      await order.save();

      res.json({
        success: true,
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference
      });
    } else {
      res.status(400).json({ error: "Failed to initialize payment." });
    }
  } catch (error) {
    if (error.response) {
      return res.status(400).json({ 
        error: error.response.data.message || "Paystack initialization failed." 
      });
    }
    next(error);
  }
});

// ── GET /api/payments/verify/:reference — Verify payment status ──
router.get("/verify/:reference", authenticate, async (req, res, next) => {
  try {
    const { reference } = req.params;

    if (reference.startsWith("MOCK-")) {
      const order = await Order.findOne({ paymentRef: reference });
      if (order) {
        order.paymentStatus = "paid";
        await order.save();
      }

      return res.json({
        success: true,
        paymentStatus: "paid",
        data: {
          reference,
          status: "success",
          amount: order ? order.total * 100 : 0,
          gateway_response: "Approved (Mock Sandbox Mode)"
        }
      });
    }

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );

    if (response.data.status && response.data.data.status === "success") {
      // Update order payment status
      const order = await Order.findOne({ paymentRef: reference });
      if (order) {
        order.paymentStatus = "paid";
        await order.save();
      }

      res.json({
        success: true,
        paymentStatus: "paid",
        data: response.data.data
      });
    } else {
      res.json({
        success: false,
        paymentStatus: "failed",
        data: response.data.data
      });
    }
  } catch (error) {
    if (error.response) {
      return res.status(400).json({ 
        error: error.response.data.message || "Payment verification failed." 
      });
    }
    next(error);
  }
});

// ── POST /api/payments/webhook — Paystack Webhook (server-to-server) ──
router.post("/webhook", async (req, res, next) => {
  try {
    // Since body-parser processes raw buffers on the webhook path, convert it to utf-8 string
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ error: "Invalid signature." });
    }

    const event = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;

      // Update order payment status
      const order = await Order.findOne({ paymentRef: reference });
      if (order) {
        order.paymentStatus = "paid";
        await order.save();

        await AuditLog.create({
          user: "Paystack",
          action: `Payment confirmed for order ${order._id} — ₦${order.total}`,
          ip: "paystack-webhook"
        });
      }
    }

    // Acknowledge webhook
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// ── GET /api/payments — Admin: get all payment records (paginated) ──
router.get("/", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const orders = await Order.find({});

    const payments = orders.map(o => ({
      id: `PAY-${o._id}`,
      orderId: o._id,
      amount: o.total,
      method: o.paymentRef ? "Paystack" : "Cash",
      status: o.paymentStatus === "paid" ? "Successful" : o.paymentStatus,
      customer: o.customerName,
      reference: o.paymentRef,
      time: o.time,
      createdAt: o.createdAt
    }));

    const total = payments.length;
    const paginated = payments.slice(offset, offset + limit);

    res.json({
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
