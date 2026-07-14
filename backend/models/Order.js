// ================================================================
// FUOTUOKE Campus Eats — Order Model (MySQL Wrapper with Transactions)
// ================================================================

const { pool } = require("../config/db");

class OrderInstance {
  constructor(data, items = []) {
    this._id = data.id;
    this.id = data.id;
    this.total = parseFloat(data.total);
    this.outlet = {
      name: data.outletName,
      id: data.outletId
    };
    this.type = data.type;
    this.faculty = data.faculty;
    this.status = data.status;
    this.customerId = data.customerId;
    this.customerName = data.customerName;
    this.paymentRef = data.paymentRef;
    this.paymentStatus = data.paymentStatus;
    this.time = data.time;
    this.assignedRiderId = data.assignedRiderId;
    this.assignedRiderName = data.assignedRiderName;
    this.assignedRiderPhone = data.assignedRiderPhone;
    this.deliveryProgress = parseInt(data.deliveryProgress || "0", 10);
    this.riderLatitude = data.riderLatitude ? parseFloat(data.riderLatitude) : null;
    this.riderLongitude = data.riderLongitude ? parseFloat(data.riderLongitude) : null;
    this.latitude = data.latitude ? parseFloat(data.latitude) : null;
    this.longitude = data.longitude ? parseFloat(data.longitude) : null;
    this.formattedAddress = data.formattedAddress || null;
    this.deliveryNotes = data.deliveryNotes || null;
    this.rating = parseInt(data.rating || "0", 10);
    this.review = data.review || "";
    this.items = items;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  async save() {
    // Allows calling order.save() to persist status, progress, location, and rating updates
    const sql = `
      UPDATE orders
      SET status = ?, paymentStatus = ?, paymentRef = ?,
          assignedRiderId = ?, assignedRiderName = ?, assignedRiderPhone = ?,
          deliveryProgress = ?, riderLatitude = ?, riderLongitude = ?, rating = ?, review = ?
      WHERE id = ?
    `;
    const params = [
      this.status,
      this.paymentStatus,
      this.paymentRef,
      this.assignedRiderId,
      this.assignedRiderName,
      this.assignedRiderPhone,
      this.deliveryProgress,
      this.riderLatitude,
      this.riderLongitude,
      this.rating,
      this.review,
      this.id
    ];
    await pool.query(sql, params);
    return this;
  }

  toJSON() {
    return { ...this };
  }
}

class Order {
  static async find(query = {}) {
    let sql = "SELECT * FROM orders WHERE 1=1";
    const params = [];

    if (query.customerId) {
      sql += " AND customerId = ?";
      params.push(query.customerId);
    }
    if (query.isRiderQuery) {
      sql += " AND (assignedRiderId = ? OR (assignedRiderId IS NULL AND type = 'delivery' AND status IN ('Preparing', 'Ready', 'Received')))";
      params.push(query.riderId);
    } else if (query.assignedRiderId) {
      sql += " AND assignedRiderId = ?";
      params.push(query.assignedRiderId);
    }
    if (query.outletName) {
      sql += " AND outletName = ?";
      params.push(query.outletName);
    }
    if (query.status) {
      if (Array.isArray(query.status)) {
        sql += " AND status IN (?)";
        params.push(query.status);
      } else {
        sql += " AND status = ?";
        params.push(query.status);
      }
    }
    if (query.paymentStatus) {
      sql += " AND paymentStatus = ?";
      params.push(query.paymentStatus);
    }

    sql += " ORDER BY createdAt DESC";

    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) return [];

    const orderIds = rows.map(r => r.id);
    
    // Fetch all order items matching order IDs
    const [itemsRows] = await pool.query("SELECT * FROM order_items WHERE orderId IN (?)", [orderIds]);
    
    let itemsMap = {};
    let itemIds = [];
    itemsRows.forEach(i => {
      if (!itemsMap[i.orderId]) itemsMap[i.orderId] = [];
      i.extras = []; // placeholder for child extras
      itemsMap[i.orderId].push(i);
      itemIds.push(i.id);
    });

    // Fetch all child extras if there are items
    if (itemIds.length > 0) {
      const [extrasRows] = await pool.query("SELECT * FROM order_item_extras WHERE orderItemId IN (?)", [itemIds]);
      const extrasMap = {};
      extrasRows.forEach(e => {
        if (!extrasMap[e.orderItemId]) extrasMap[e.orderItemId] = [];
        extrasMap[e.orderItemId].push({ name: e.name, price: parseFloat(e.price) });
      });

      // Attach extras to items
      itemsRows.forEach(i => {
        i.extras = extrasMap[i.id] || [];
        i.price = parseFloat(i.price);
        i.qty = parseInt(i.qty, 10);
      });
    }

    return rows.map(r => new OrderInstance(r, itemsMap[r.id] || []));
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
    if (rows.length === 0) return null;

    const [itemsRows] = await pool.query("SELECT * FROM order_items WHERE orderId = ?", [id]);
    
    if (itemsRows.length > 0) {
      const itemIds = itemsRows.map(i => i.id);
      const [extrasRows] = await pool.query("SELECT * FROM order_item_extras WHERE orderItemId IN (?)", [itemIds]);
      
      const extrasMap = {};
      extrasRows.forEach(e => {
        if (!extrasMap[e.orderItemId]) extrasMap[e.orderItemId] = [];
        extrasMap[e.orderItemId].push({ name: e.name, price: parseFloat(e.price) });
      });

      itemsRows.forEach(i => {
        i.extras = extrasMap[i.id] || [];
        i.price = parseFloat(i.price);
        i.qty = parseInt(i.qty, 10);
      });
    }

    return new OrderInstance(rows[0], itemsRows);
  }

  static async findOne(query) {
    const orders = await this.find(query);
    return orders.length > 0 ? orders[0] : null;
  }

  static async create(data) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const orderSql = `
        INSERT INTO orders (total, outletName, outletId, type, faculty, status, customerId, customerName, paymentRef, paymentStatus, time, latitude, longitude, formattedAddress, deliveryNotes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const orderParams = [
        data.total,
        data.outlet.name,
        data.outlet.id || null,
        data.type,
        data.faculty || null,
        data.status || "Received",
        data.customerId,
        data.customerName,
        data.paymentRef || null,
        data.paymentStatus || "pending",
        data.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data.latitude !== undefined ? data.latitude : null,
        data.longitude !== undefined ? data.longitude : null,
        data.formattedAddress || null,
        data.deliveryNotes || null
      ];

      const [orderResult] = await connection.query(orderSql, orderParams);
      const newOrderId = orderResult.insertId;

      for (const item of data.items) {
        const itemSql = `
          INSERT INTO order_items (orderId, menuItemId, name, price, qty, emoji)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        const itemParams = [
          newOrderId,
          item.menuItemId || null,
          item.name,
          item.price,
          item.qty,
          item.emoji || ""
        ];
        const [itemResult] = await connection.query(itemSql, itemParams);
        const newOrderItemId = itemResult.insertId;

        if (Array.isArray(item.extras) && item.extras.length > 0) {
          const extrasSql = "INSERT INTO order_item_extras (orderItemId, name, price) VALUES ?";
          const extrasValues = item.extras.map(e => [newOrderItemId, e.name, e.price]);
          await connection.query(extrasSql, [extrasValues]);
        }
      }

      await connection.commit();
      connection.release();
      
      return this.findById(newOrderId);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  static async findByIdAndUpdate(id, updates) {
    const allowedFields = ["status", "paymentStatus", "paymentRef", "assignedRiderId", "assignedRiderName", "assignedRiderPhone", "deliveryProgress", "rating", "review"];
    const fields = [];
    const params = [];

    allowedFields.forEach(f => {
      if (updates[f] !== undefined) {
        fields.push(`\`${f}\` = ?`);
        params.push(updates[f]);
      }
    });

    if (fields.length > 0) {
      params.push(id);
      const sql = `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`;
      await pool.query(sql, params);
    }

    return this.findById(id);
  }
}

module.exports = Order;
