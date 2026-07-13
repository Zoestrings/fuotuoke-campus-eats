// ================================================================
// FUOTUOKE Campus Eats — RefreshToken Model (MySQL Wrapper)
// ================================================================

const { pool } = require("../config/db");

class RefreshToken {
  static async create({ userId, token, expiresAt }) {
    const sql = "INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, ?)";
    const params = [userId, token, expiresAt];
    const [result] = await pool.query(sql, params);
    return { id: result.insertId, userId, token, expiresAt };
  }

  static async findOne({ token }) {
    const sql = "SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1";
    const [rows] = await pool.query(sql, [token]);
    if (rows.length === 0) return null;
    return rows[0];
  }

  static async deleteOne({ token }) {
    const sql = "DELETE FROM refresh_tokens WHERE token = ?";
    const [result] = await pool.query(sql, [token]);
    return result.affectedRows > 0;
  }

  static async deleteMany({ userId }) {
    const sql = "DELETE FROM refresh_tokens WHERE userId = ?";
    const [result] = await pool.query(sql, [userId]);
    return result.affectedRows > 0;
  }
}

module.exports = RefreshToken;
