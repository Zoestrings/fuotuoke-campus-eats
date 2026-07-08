// ================================================================
// FUOTUOKE Campus Eats — User Model (MySQL Wrapper)
// ================================================================

const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

class UserInstance {
  constructor(data) {
    this._id = data.id;
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.status = data.status;
    this.canteen = data.canteen || null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const copy = { ...this };
    delete copy.password;
    return copy;
  }
}

class User {
  static async findOne(query) {
    let sql = "SELECT * FROM users WHERE 1=1";
    const params = [];
    
    if (query.id) {
      sql += " AND id = ?";
      params.push(query.id);
    }
    if (query.userId) {
      sql += " AND userId = ?";
      params.push(query.userId);
    }
    if (query.role) {
      sql += " AND role = ?";
      params.push(query.role);
    }
    if (query.email) {
      sql += " AND email = ?";
      params.push(query.email);
    }
    
    sql += " LIMIT 1";
    
    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) return null;
    return new UserInstance(rows[0]);
  }

  static async findById(id) {
    return this.findOne({ id });
  }

  static async create(data) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const sql = `
      INSERT INTO users (userId, name, email, password, role, status, canteen)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.userId.toUpperCase(),
      data.name,
      data.email,
      hashedPassword,
      data.role || "student",
      data.status || "active",
      data.canteen || null
    ];
    
    const [result] = await pool.query(sql, params);
    const newId = result.insertId;
    return this.findById(newId);
  }

  static async find(query = {}) {
    let sql = "SELECT * FROM users WHERE 1=1";
    const params = [];
    
    if (query.role) {
      sql += " AND role = ?";
      params.push(query.role);
    }
    if (query.status) {
      sql += " AND status = ?";
      params.push(query.status);
    }
    
    sql += " ORDER BY createdAt DESC";
    
    const [rows] = await pool.query(sql, params);
    return rows.map(r => new UserInstance(r));
  }

  static async findByIdAndUpdate(id, updates) {
    const fields = [];
    const params = [];
    
    const allowedFields = ["name", "email", "status", "canteen"];
    allowedFields.forEach(f => {
      if (updates[f] !== undefined) {
        fields.push(`\`${f}\` = ?`);
        params.push(updates[f]);
      }
    });
    
    if (updates.password) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(updates.password, salt);
      fields.push("`password` = ?");
      params.push(hashedPassword);
    }
    
    if (fields.length === 0) return this.findById(id);
    
    params.push(id);
    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(sql, params);
    return this.findById(id);
  }

  static async findByIdAndDelete(id) {
    const user = await this.findById(id);
    if (!user) return null;
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return user;
  }
}

module.exports = User;
