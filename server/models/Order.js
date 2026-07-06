// ================================================================
// FUOTUOKE Campus Eats — Order Model (Mongoose)
// ================================================================

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  emoji: { type: String, default: "" },
  extras: [{
    name: String,
    price: Number
  }]
}, { _id: false });

const orderSchema = new mongoose.Schema({
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: "Order must contain at least one item."
    }
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  outlet: {
    name: { type: String, required: true },
    loc: { type: String },
    id: { type: String }
  },
  type: {
    type: String,
    enum: ["pickup", "delivery"],
    required: true
  },
  faculty: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["Received", "Preparing", "Ready", "Completed", "Cancelled"],
    default: "Received"
  },
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  // Paystack payment fields
  paymentRef: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
