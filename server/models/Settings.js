// ================================================================
// FUOTUOKE Campus Eats — Settings Model (Mongoose)
// Single-document pattern for system-wide configuration.
// ================================================================

const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  allowDeliveries: {
    type: Boolean,
    default: true
  },
  deliveryFee: {
    type: Number,
    default: 500
  },
  supportPhone: {
    type: String,
    default: "080-3333-4444"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Settings", settingsSchema);
