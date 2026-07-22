// ================================================================
// FUOTUOKE Campus Eats — Mock DB: Menu Handler
// Handles: menu_items and menu_extras tables
// ================================================================

/**
 * @param {object} db          - Full in-memory database object
 * @param {Function} saveDb    - Persists db to disk
 * @param {string} upperSql    - Uppercased SQL string
 * @param {string} normalizedSql - Whitespace-normalized original SQL
 * @param {Array}  params      - Bound parameter values
 * @returns {Array|null} [result, fields] or null if no match
 */
function handleMenu(db, saveDb, upperSql, normalizedSql, params) {
  // ── SELECT menu_items ─────────────────────────────────────────
  if (upperSql.startsWith("SELECT * FROM MENU_ITEMS")) {
    let results = [...db.menu_items];

    if (normalizedSql.includes("id = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter((item) => item.id === id);
    } else {
      let paramIdx = 0;
      const filters = [];
      if (normalizedSql.includes("AND cat = ?"))       filters.push({ key: "cat",       val: params[paramIdx++] });
      if (normalizedSql.includes("AND available = ?")) filters.push({ key: "available", val: params[paramIdx++] });
      results = results.filter((row) =>
        filters.every((f) => String(row[f.key]) === String(f.val))
      );
    }
    return [results, []];
  }

  // ── SELECT menu_extras ────────────────────────────────────────
  if (upperSql.startsWith("SELECT * FROM MENU_EXTRAS")) {
    let results = [...db.menu_extras];
    if (
      upperSql.includes("MENUITEMID IN (?)") ||
      upperSql.includes("MENUITEMID IN ?")
    ) {
      const ids = Array.isArray(params[0]) ? params[0] : [params[0]];
      results = results.filter((e) => ids.includes(e.menuItemId));
    } else if (normalizedSql.includes("menuItemId = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter((e) => e.menuItemId === id);
    }
    return [results, []];
  }

  // ── INSERT menu_items ─────────────────────────────────────────
  if (upperSql.startsWith("INSERT INTO MENU_ITEMS")) {
    const nextId =
      db.menu_items.reduce((max, m) => (m.id > max ? m.id : max), 0) + 1;
    const newItem = {
      id: nextId,
      name: params[0],
      price: parseFloat(params[1]),
      cat: params[2],
      emoji: params[3] || "",
      image: params[4] || "",
      desc: params[5] || "",
      popular: params[6] ? 1 : 0,
      available: params[7] !== false ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.menu_items.push(newItem);
    saveDb(db);
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // ── INSERT menu_extras ────────────────────────────────────────
  if (upperSql.startsWith("INSERT INTO MENU_EXTRAS")) {
    const values = params[0];
    if (Array.isArray(values)) {
      values.forEach((v) => {
        const nextId =
          db.menu_extras.reduce((max, e) => (e.id > max ? e.id : max), 0) + 1;
        db.menu_extras.push({
          id: nextId,
          menuItemId: parseInt(v[0], 10),
          name: v[1],
          price: parseFloat(v[2])
        });
      });
      saveDb(db);
    }
    return [{ affectedRows: values ? values.length : 0 }, []];
  }

  // ── UPDATE menu_items ─────────────────────────────────────────
  if (upperSql.startsWith("UPDATE MENU_ITEMS")) {
    const id = parseInt(params[params.length - 1], 10);
    const item = db.menu_items.find((m) => m.id === id);
    if (item) {
      let pIdx = 0;
      if (normalizedSql.includes("`name` = ?"))      item.name      = params[pIdx++];
      if (normalizedSql.includes("`price` = ?"))     item.price     = parseFloat(params[pIdx++]);
      if (normalizedSql.includes("`cat` = ?"))       item.cat       = params[pIdx++];
      if (normalizedSql.includes("`emoji` = ?"))     item.emoji     = params[pIdx++];
      if (normalizedSql.includes("`image` = ?"))     item.image     = params[pIdx++];
      if (normalizedSql.includes("`desc` = ?"))      item.desc      = params[pIdx++];
      if (normalizedSql.includes("`popular` = ?"))   item.popular   = params[pIdx++] ? 1 : 0;
      if (normalizedSql.includes("`available` = ?")) item.available = params[pIdx++] ? 1 : 0;
      item.updatedAt = new Date().toISOString();
      saveDb(db);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // ── DELETE menu_extras (by menuItemId, before deleting the item) ──
  if (upperSql.startsWith("DELETE FROM MENU_EXTRAS")) {
    const menuItemId = parseInt(params[0], 10);
    db.menu_extras = db.menu_extras.filter((e) => e.menuItemId !== menuItemId);
    saveDb(db);
    return [{ affectedRows: 1 }, []];
  }

  // ── DELETE menu_items ─────────────────────────────────────────
  if (upperSql.startsWith("DELETE FROM MENU_ITEMS")) {
    const id = parseInt(params[0], 10);
    db.menu_items  = db.menu_items.filter((m) => m.id !== id);
    db.menu_extras = db.menu_extras.filter((e) => e.menuItemId !== id);
    saveDb(db);
    return [{ affectedRows: 1 }, []];
  }

  return null;
}

module.exports = { handleMenu };
