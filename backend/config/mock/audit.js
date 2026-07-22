// ================================================================
// FUOTUOKE Campus Eats — Mock DB: Audit Logs Handler
// Handles: audit_logs table (SELECT, INSERT)
// ================================================================

/**
 * @param {object} db          - Full in-memory database object
 * @param {Function} saveDb    - Persists db to disk
 * @param {string} upperSql    - Uppercased SQL string
 * @param {string} normalizedSql - Whitespace-normalized original SQL (unused here)
 * @param {Array}  params      - Bound parameter values
 * @returns {Array|null} [result, fields] or null if no match
 */
function handleAudit(db, saveDb, upperSql, _normalizedSql, params) {
  // ── INSERT audit_logs ─────────────────────────────────────────
  if (upperSql.startsWith("INSERT INTO AUDIT_LOGS")) {
    const nextId =
      db.audit_logs.reduce((max, l) => (l.id > max ? l.id : max), 0) + 1;
    const newLog = {
      id: nextId,
      userId: params[0],
      action: params[1],
      details: params[2] || "",
      ipAddress: params[3] || null,
      createdAt: new Date().toISOString()
    };
    db.audit_logs.push(newLog);
    saveDb(db);
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // ── SELECT audit_logs ─────────────────────────────────────────
  if (upperSql.startsWith("SELECT * FROM AUDIT_LOGS")) {
    const results = [...db.audit_logs].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    // Respect LIMIT / OFFSET if provided
    const limitVal  = params && params[0] ? parseInt(params[0], 10)  : 100;
    const offsetVal = params && params[1] ? parseInt(params[1], 10) : 0;
    return [results.slice(offsetVal, offsetVal + limitVal), []];
  }

  return null;
}

module.exports = { handleAudit };
