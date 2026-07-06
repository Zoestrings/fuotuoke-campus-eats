// ================================================================
// FUOTUOKE Campus Eats — AuditLog Model (Mongoose)
// ================================================================

const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    default: "127.0.0.1"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
