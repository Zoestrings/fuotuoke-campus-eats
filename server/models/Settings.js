// ================================================================
// FUOTUOKE Campus Eats — Settings Model (MySQL Wrapper)
// ================================================================

const { pool } = require("../config/db");

class SettingsInstance {
  constructor(data) {
    this._id = data.id;
    this.id = data.id;
    this.maintenanceMode = !!data.maintenanceMode;
    this.allowRegistration = !!data.allowRegistration;
    this.allowDeliveries = !!data.allowDeliveries;
    this.deliveryFee = parseFloat(data.deliveryFee);
    this.supportPhone = data.supportPhone || "";
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  async save() {
    const sql = `
      UPDATE settings
      SET maintenanceMode = ?, allowRegistration = ?, allowDeliveries = ?,
          deliveryFee = ?, supportPhone = ?
      WHERE id = 1
    `;
    const params = [
      this.maintenanceMode ? 1 : 0,
      this.allowRegistration ? 1 : 0,
      this.allowDeliveries ? 1 : 0,
      this.deliveryFee,
      this.supportPhone
    ];
    await pool.query(sql, params);
    return this;
  }

  toJSON() {
    return { ...this };
  }
}

class Settings {
  static async findOne() {
    const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1 LIMIT 1");
    if (rows.length === 0) return null;
    return new SettingsInstance(rows[0]);
  }

  static async create(data = {}) {
    const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1 LIMIT 1");
    if (rows.length > 0) return new SettingsInstance(rows[0]);

    const sql = `
      INSERT INTO settings (id, maintenanceMode, allowRegistration, allowDeliveries, deliveryFee, supportPhone)
      VALUES (1, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.maintenanceMode ? 1 : 0,
      data.allowRegistration !== false ? 1 : 0,
      data.allowDeliveries !== false ? 1 : 0,
      data.deliveryFee || 300.00,
      data.supportPhone || "08012345678"
    ];
    await pool.query(sql, params);
    return this.findOne();
  }
}

module.exports = Settings;
