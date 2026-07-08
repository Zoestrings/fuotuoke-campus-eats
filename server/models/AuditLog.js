// ================================================================
// FUOTUOKE Campus Eats — AuditLog Model (MySQL Wrapper)
// ================================================================

const { pool } = require("../config/db");

class AuditLog {
  static async create(data) {
    const sql = "INSERT INTO audit_logs (userId, action, details, ipAddress) VALUES (?, ?, ?, ?)";
    const params = [
      data.user || null,
      data.action,
      data.details || "",
      data.ip || null
    ];
    const [result] = await pool.query(sql, params);
    return { id: result.insertId, ...data };
  }

  static async find(query = {}) {
    let sql = "SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 100";
    const [rows] = await pool.query(sql);
    // Map column names to Mongoose schema naming convention for compatibility
    return rows.map(r => ({
      id: r.id,
      _id: r.id,
      user: r.userId,
      action: r.action,
      details: r.details,
      ip: r.ipAddress,
      createdAt: r.createdAt
    }));
  }
}

module.exports = AuditLog;
