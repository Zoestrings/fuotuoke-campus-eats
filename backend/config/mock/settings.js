// ================================================================
// FUOTUOKE Campus Eats — Mock DB: Settings Handler
// Handles: settings table (SELECT, INSERT, UPDATE)
// ================================================================

/**
 * @param {object} db   - Full in-memory database object
 * @param {Function} saveDb - Persists db to disk
 * @param {string} upperSql - Uppercased SQL string
 * @param {string} normalizedSql - Whitespace-normalized original SQL
 * @param {Array}  params - Bound parameter values
 * @returns {Array|null} [result, fields] or null if no match
 */
function handleSettings(db, saveDb, upperSql, normalizedSql, params) {
  // SELECT settings by id=1
  if (
    upperSql.includes("SELECT * FROM SETTINGS WHERE ID = 1") ||
    upperSql.includes("SELECT * FROM SETTINGS WHERE ID=1")
  ) {
    return [db.settings.filter((s) => s.id === 1), []];
  }

  // INSERT settings (initial seed)
  if (upperSql.startsWith("INSERT INTO SETTINGS")) {
    return [{ insertId: 1 }, []];
  }

  // UPDATE settings
  if (upperSql.startsWith("UPDATE SETTINGS")) {
    const settings = db.settings[0] || { id: 1 };
    settings.maintenanceMode   = params[0];
    settings.allowRegistration = params[1];
    settings.allowDeliveries   = params[2];
    settings.deliveryFee       = parseFloat(params[3]);
    settings.supportPhone      = params[4];
    settings.updatedAt         = new Date().toISOString();
    db.settings[0] = settings;
    saveDb(db);
    return [{ affectedRows: 1 }, []];
  }

  return null;
}

module.exports = { handleSettings };
