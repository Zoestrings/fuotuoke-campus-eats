// ================================================================
// FUOTUOKE Campus Eats — Mock DB: Central Query Router (index.js)
//
// Receives raw SQL + params and dispatches to the appropriate
// domain handler. Import and call executeMockQuery() from db.js.
// ================================================================

const { handleSettings }                  = require("./settings");
const { handleUsers, handleRefreshTokens } = require("./users");
const { handleMenu }                       = require("./menu");
const { handleOrders }                     = require("./orders");
const { handleAudit }                      = require("./audit");

/**
 * Route a SQL statement to the correct domain handler.
 *
 * @param {object}   db          - Full in-memory database object (mutated directly)
 * @param {Function} saveDb      - Function that persists db to disk
 * @param {string}   sql         - Original SQL string
 * @param {Array}    params      - Bound parameter values
 * @returns {Promise<Array>}     Resolves to [result, fields] — same shape as mysql2
 */
async function executeMockQuery(db, saveDb, sql, params = []) {
  const normalizedSql = sql.trim().replace(/\s+/g, " ");
  const upperSql      = normalizedSql.toUpperCase();

  // Try each domain handler in priority order.
  // Each handler returns [result, fields] on match, or null to pass through.
  const handlers = [
    () => handleSettings(db, saveDb, upperSql, normalizedSql, params),
    () => handleUsers(db, saveDb, upperSql, normalizedSql, params),
    () => handleRefreshTokens(db, saveDb, upperSql, normalizedSql, params),
    () => handleMenu(db, saveDb, upperSql, normalizedSql, params),
    () => handleOrders(db, saveDb, upperSql, normalizedSql, params),
    () => handleAudit(db, saveDb, upperSql, normalizedSql, params),
  ];

  for (const handler of handlers) {
    const result = handler();
    if (result !== null) return result;
  }

  // No handler matched — return a safe no-op result
  return [{ affectedRows: 0 }, []];
}

module.exports = { executeMockQuery };
