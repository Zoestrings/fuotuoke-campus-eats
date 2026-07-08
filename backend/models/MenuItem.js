// ================================================================
// FUOTUOKE Campus Eats — MenuItem Model (MySQL Wrapper)
// ================================================================

const { pool } = require("../config/db");

class MenuItemInstance {
  constructor(data, extras = []) {
    this._id = data.id;
    this.id = data.id;
    this.name = data.name;
    this.price = parseFloat(data.price);
    this.cat = data.cat;
    this.emoji = data.emoji || "";
    this.image = data.image || "";
    this.desc = data.desc || "";
    this.popular = !!data.popular;
    this.available = !!data.available;
    this.extras = extras.map(e => ({ name: e.name, price: parseFloat(e.price) }));
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return { ...this };
  }
}

class MenuItem {
  static async find(query = {}) {
    let sql = "SELECT * FROM menu_items WHERE 1=1";
    const params = [];

    if (query.cat) {
      sql += " AND cat = ?";
      params.push(query.cat);
    }
    if (query.available !== undefined) {
      sql += " AND available = ?";
      params.push(query.available ? 1 : 0);
    }

    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) return [];

    // Fetch all extras for these menu items in bulk to be efficient
    const itemIds = rows.map(r => r.id);
    const [extrasRows] = await pool.query(
      "SELECT * FROM menu_extras WHERE menuItemId IN (?)",
      [itemIds]
    );

    // Map extras by menuItemId
    const extrasMap = {};
    extrasRows.forEach(e => {
      if (!extrasMap[e.menuItemId]) extrasMap[e.menuItemId] = [];
      extrasMap[e.menuItemId].push(e);
    });

    return rows.map(r => new MenuItemInstance(r, extrasMap[r.id] || []));
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM menu_items WHERE id = ? LIMIT 1", [id]);
    if (rows.length === 0) return null;

    const [extrasRows] = await pool.query("SELECT * FROM menu_extras WHERE menuItemId = ?", [id]);
    return new MenuItemInstance(rows[0], extrasRows);
  }

  static async findOne(query) {
    let sql = "SELECT * FROM menu_items WHERE 1=1";
    const params = [];
    for (const key in query) {
      sql += ` AND \`${key}\` = ?`;
      params.push(query[key]);
    }
    sql += " LIMIT 1";

    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) return null;

    const [extrasRows] = await pool.query("SELECT * FROM menu_extras WHERE menuItemId = ?", [rows[0].id]);
    return new MenuItemInstance(rows[0], extrasRows);
  }

  static async create(data) {
    const sql = `
      INSERT INTO menu_items (name, price, cat, emoji, image, \`desc\`, popular, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.name,
      data.price,
      data.cat,
      data.emoji || "",
      data.image || "",
      data.desc || "Freshly prepared campus special.",
      data.popular ? 1 : 0,
      data.available !== false ? 1 : 0
    ];

    const [result] = await pool.query(sql, params);
    const newId = result.insertId;

    // Save child extras if provided
    if (Array.isArray(data.extras) && data.extras.length > 0) {
      const extrasSql = "INSERT INTO menu_extras (menuItemId, name, price) VALUES ?";
      const extrasValues = data.extras.map(e => [newId, e.name, e.price]);
      await pool.query(extrasSql, [extrasValues]);
    }

    return this.findById(newId);
  }

  static async findByIdAndUpdate(id, updates) {
    const fields = [];
    const params = [];
    
    // Split properties to update in main table
    const allowedFields = ["name", "price", "cat", "emoji", "image", "desc", "popular", "available"];
    allowedFields.forEach(f => {
      if (updates[f] !== undefined) {
        fields.push(`\`${f}\` = ?`);
        params.push(f === "popular" || f === "available" ? (updates[f] ? 1 : 0) : updates[f]);
      }
    });

    if (fields.length > 0) {
      params.push(id);
      await pool.query(`UPDATE menu_items SET ${fields.join(", ")} WHERE id = ?`, params);
    }

    // Replace child extras if provided in updates
    if (updates.extras !== undefined) {
      await pool.query("DELETE FROM menu_extras WHERE menuItemId = ?", [id]);
      if (Array.isArray(updates.extras) && updates.extras.length > 0) {
        const extrasSql = "INSERT INTO menu_extras (menuItemId, name, price) VALUES ?";
        const extrasValues = updates.extras.map(e => [id, e.name, e.price]);
        await pool.query(extrasSql, [extrasValues]);
      }
    }

    return this.findById(id);
  }

  static async findByIdAndDelete(id) {
    const item = await this.findById(id);
    if (!item) return null;
    await pool.query("DELETE FROM menu_items WHERE id = ?", [id]);
    return item;
  }
}

module.exports = MenuItem;
