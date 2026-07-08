// ================================================================
// FUOTUOKE Campus Eats — User Management Routes (Admin only)
// GET /api/users, PATCH /:id/status, DELETE /:id
// ================================================================

const express = require("express");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, requireRole("admin"));

// ── GET /api/users — Get all users ──
router.get("/", async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    let users = await User.find(filter);

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        u => u.userId.toLowerCase().includes(searchLower) ||
             u.name.toLowerCase().includes(searchLower) ||
             u.email.toLowerCase().includes(searchLower)
      );
    }

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/users/:id/status — Toggle user active/inactive ──
router.patch("/:id/status", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const newStatus = user.status === "active" ? "inactive" : "active";
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { status: newStatus });

    // Audit log
    await AuditLog.create({
      user: req.user.userId,
      action: `Set user ${user.userId} status to ${newStatus}`,
      ip: req.ip
    });

    res.json({ success: true, user: updatedUser.toJSON(), newStatus });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/users/:id — Delete user ──
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Audit log
    await AuditLog.create({
      user: req.user.userId,
      action: `Deleted user ${user.userId}`,
      ip: req.ip
    });

    res.json({ success: true, message: "User deleted." });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/users — Admin: create new user ──
router.post("/", async (req, res, next) => {
  try {
    const { id, name, email, password, role, canteen } = req.body;
    
    if (!id || !name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }
    
    const existing = await User.findOne({ userId: id.toUpperCase(), role });
    if (existing) {
      return res.status(409).json({ error: "An account with this ID and role already exists." });
    }
    
    const user = await User.create({
      userId: id.toUpperCase(),
      name,
      email,
      password,
      role,
      status: "active",
      canteen: role === "kitchen" ? canteen : null
    });
    
    await AuditLog.create({
      user: req.user.userId,
      action: `Created new user ${id.toUpperCase()} with role ${role}`,
      ip: req.ip
    });
    
    res.status(201).json(user.toJSON());
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/users/:id — Admin: update user details ──
router.put("/:id", async (req, res, next) => {
  try {
    const { name, email, status, canteen, password } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (status !== undefined) updates.status = status;
    if (canteen !== undefined) updates.canteen = canteen;
    if (password) updates.password = password;
    
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates);
    
    await AuditLog.create({
      user: req.user.userId,
      action: `Updated user details for ${user.userId}`,
      ip: req.ip
    });
    
    res.json(updatedUser.toJSON());
  } catch (error) {
    next(error);
  }
});

module.exports = router;
