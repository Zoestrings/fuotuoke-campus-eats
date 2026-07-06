// ================================================================
// FUOTUOKE Campus Eats — MenuItem Model (Mongoose)
// ================================================================

const mongoose = require("mongoose");

const extraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Dish name is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  cat: {
    type: String,
    required: true,
    enum: ["Rice", "Soup", "Mains", "Snacks", "Drinks"]
  },
  emoji: {
    type: String,
    default: ""
  },
  desc: {
    type: String,
    default: "Freshly prepared campus special."
  },
  popular: {
    type: Boolean,
    default: false
  },
  extras: {
    type: [extraSchema],
    default: []
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
