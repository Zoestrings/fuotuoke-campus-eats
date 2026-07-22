// ================================================================
// FUOTUOKE Campus Eats — Mock DB: Orders Handler
// Handles: orders, order_items, order_item_extras tables
// ================================================================

/**
 * @param {object} db          - Full in-memory database object
 * @param {Function} saveDb    - Persists db to disk
 * @param {string} upperSql    - Uppercased SQL string
 * @param {string} normalizedSql - Whitespace-normalized original SQL
 * @param {Array}  params      - Bound parameter values
 * @returns {Array|null} [result, fields] or null if no match
 */
function handleOrders(db, saveDb, upperSql, normalizedSql, params) {
  // ── SELECT orders ─────────────────────────────────────────────
  if (upperSql.startsWith("SELECT * FROM ORDERS")) {
    let results = [...db.orders];

    if (normalizedSql.includes("id = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter((o) => o.id === id);
    } else if (normalizedSql.includes("assignedRiderId = ? OR")) {
      // Rider dashboard: own orders OR available delivery orders
      const riderId = params[0];
      results = results.filter(
        (o) =>
          o.assignedRiderId === riderId ||
          (!o.assignedRiderId &&
            o.type === "delivery" &&
            ["Preparing", "Ready", "Received", "Completed"].includes(o.status))
      );
    } else {
      let pIdx = 0;
      const filters = [];
      if (normalizedSql.includes("AND customerId = ?"))      filters.push({ key: "customerId",      val: params[pIdx++] });
      if (normalizedSql.includes("AND assignedRiderId = ?")) filters.push({ key: "assignedRiderId", val: params[pIdx++] });
      if (normalizedSql.includes("AND outletName = ?"))      filters.push({ key: "outletName",      val: params[pIdx++] });

      if (normalizedSql.includes("AND status IN (?)")) {
        filters.push({ key: "status", val: params[pIdx++], isArray: true });
      } else if (normalizedSql.includes("AND status = ?")) {
        filters.push({ key: "status", val: params[pIdx++] });
      }

      if (normalizedSql.includes("AND paymentStatus = ?"))
        filters.push({ key: "paymentStatus", val: params[pIdx++] });

      results = results.filter((o) =>
        filters.every((f) => {
          if (f.isArray) {
            const arr = Array.isArray(f.val) ? f.val : [f.val];
            return arr.includes(o[f.key]);
          }
          return String(o[f.key]) === String(f.val);
        })
      );
    }

    if (upperSql.includes("ORDER BY CREATEDAT DESC")) {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [results, []];
  }

  // ── SELECT order_items ────────────────────────────────────────
  if (upperSql.startsWith("SELECT * FROM ORDER_ITEMS")) {
    let results = [...db.order_items];
    if (
      upperSql.includes("ORDERID IN (?)") ||
      upperSql.includes("ORDERID IN ?")
    ) {
      const ids = Array.isArray(params[0]) ? params[0] : [params[0]];
      results = results.filter((item) => ids.includes(item.orderId));
    } else if (normalizedSql.includes("orderId = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter((item) => item.orderId === id);
    }
    return [results, []];
  }

  // ── SELECT order_item_extras ──────────────────────────────────
  if (upperSql.startsWith("SELECT * FROM ORDER_ITEM_EXTRAS")) {
    let results = [...db.order_item_extras];
    if (
      upperSql.includes("ORDERITEMID IN (?)") ||
      upperSql.includes("ORDERITEMID IN ?")
    ) {
      const ids = Array.isArray(params[0]) ? params[0] : [params[0]];
      results = results.filter((e) => ids.includes(e.orderItemId));
    } else if (normalizedSql.includes("orderItemId = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter((e) => e.orderItemId === id);
    }
    return [results, []];
  }

  // ── INSERT orders ─────────────────────────────────────────────
  if (upperSql.startsWith("INSERT INTO ORDERS")) {
    const nextId =
      db.orders.reduce((max, o) => (o.id > max ? o.id : max), 0) + 1;
    const newOrder = {
      id: nextId,
      total: parseFloat(params[0]),
      outletName: params[1],
      outletId: params[2] || null,
      type: params[3],
      faculty: params[4] || null,
      status: params[5],
      customerId: params[6],
      customerName: params[7],
      paymentRef: params[8] || null,
      paymentStatus: params[9] || "pending",
      time: params[10],
      assignedRiderId: null,
      assignedRiderName: null,
      assignedRiderPhone: null,
      deliveryProgress: 0,
      riderLatitude: null,
      riderLongitude: null,
      latitude: params[11] !== undefined ? parseFloat(params[11]) : null,
      longitude: params[12] !== undefined ? parseFloat(params[12]) : null,
      formattedAddress: params[13] || null,
      deliveryNotes: params[14] || null,
      rating: 0,
      review: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    saveDb(db);
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // ── INSERT order_items ────────────────────────────────────────
  if (upperSql.startsWith("INSERT INTO ORDER_ITEMS")) {
    const nextId =
      db.order_items.reduce((max, i) => (i.id > max ? i.id : max), 0) + 1;
    const newItem = {
      id: nextId,
      orderId: parseInt(params[0], 10),
      menuItemId: params[1] ? parseInt(params[1], 10) : null,
      name: params[2],
      price: parseFloat(params[3]),
      qty: parseInt(params[4], 10),
      emoji: params[5] || ""
    };
    db.order_items.push(newItem);
    saveDb(db);
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // ── INSERT order_item_extras ──────────────────────────────────
  if (upperSql.startsWith("INSERT INTO ORDER_ITEM_EXTRAS")) {
    const values = params[0];
    if (Array.isArray(values)) {
      values.forEach((v) => {
        const nextId =
          db.order_item_extras.reduce((max, e) => (e.id > max ? e.id : max), 0) + 1;
        db.order_item_extras.push({
          id: nextId,
          orderItemId: parseInt(v[0], 10),
          name: v[1],
          price: parseFloat(v[2])
        });
      });
      saveDb(db);
    }
    return [{ affectedRows: values ? values.length : 0 }, []];
  }

  // ── UPDATE orders ─────────────────────────────────────────────
  if (upperSql.startsWith("UPDATE ORDERS")) {
    const id = parseInt(params[params.length - 1], 10);
    const order = db.orders.find((o) => o.id === id);
    if (order) {
      if (upperSql.includes("SET STATUS = ?")) {
        // Full status update (used by payment confirmation path)
        order.status           = params[0];
        order.paymentStatus    = params[1];
        order.paymentRef       = params[2];
        order.assignedRiderId  = params[3];
        order.assignedRiderName  = params[4];
        order.assignedRiderPhone = params[5];
        order.deliveryProgress = parseInt(params[6], 10);
        order.rating           = parseInt(params[7], 10);
        order.review           = params[8];
      } else {
        // Partial update (used by status patches)
        let pIdx = 0;
        if (normalizedSql.includes("status = ?"))           order.status           = params[pIdx++];
        if (normalizedSql.includes("paymentStatus = ?"))    order.paymentStatus    = params[pIdx++];
        if (normalizedSql.includes("paymentRef = ?"))       order.paymentRef       = params[pIdx++];
        if (normalizedSql.includes("assignedRiderId = ?"))  order.assignedRiderId  = params[pIdx++];
        if (normalizedSql.includes("assignedRiderName = ?")) order.assignedRiderName = params[pIdx++];
        if (normalizedSql.includes("assignedRiderPhone = ?")) order.assignedRiderPhone = params[pIdx++];
        if (normalizedSql.includes("deliveryProgress = ?")) order.deliveryProgress = parseInt(params[pIdx++], 10);
        if (normalizedSql.includes("rating = ?"))           order.rating           = parseInt(params[pIdx++], 10);
        if (normalizedSql.includes("review = ?"))           order.review           = params[pIdx++];
      }
      order.updatedAt = new Date().toISOString();
      saveDb(db);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  return null;
}

module.exports = { handleOrders };
