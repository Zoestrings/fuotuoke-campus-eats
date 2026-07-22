// ================================================================
// FUOTUOKE Campus Eats — Mock DB: Users + Refresh Tokens Handler
// Handles: users table and refresh_tokens table
// ================================================================

/**
 * @param {object} db          - Full in-memory database object
 * @param {Function} saveDb    - Persists db to disk
 * @param {string} upperSql    - Uppercased SQL string
 * @param {string} normalizedSql - Whitespace-normalized original SQL
 * @param {Array}  params      - Bound parameter values
 * @returns {Array|null} [result, fields] or null if no match
 */
function handleUsers(db, saveDb, upperSql, normalizedSql, params) {
  // ── SELECT users ─────────────────────────────────────────────
  if (upperSql.startsWith("SELECT * FROM USERS")) {
    let results = [...db.users];

    // Build filter list from SQL clauses
    let paramIdx = 0;
    const filters = [];
    if (normalizedSql.includes("AND id = ?"))     filters.push({ key: "id",     val: params[paramIdx++] });
    if (normalizedSql.includes("AND userId = ?")) filters.push({ key: "userId", val: params[paramIdx++] });
    if (normalizedSql.includes("AND role = ?"))   filters.push({ key: "role",   val: params[paramIdx++] });
    if (normalizedSql.includes("AND email = ?"))  filters.push({ key: "email",  val: params[paramIdx++] });
    if (normalizedSql.includes("AND status = ?")) filters.push({ key: "status", val: params[paramIdx++] });

    results = results.filter((row) =>
      filters.every((f) => {
        if (f.key === "userId" || f.key === "email") {
          // Case-insensitive match for string identifiers
          return String(row[f.key]).trim().toLowerCase() === String(f.val).trim().toLowerCase();
        }
        return String(row[f.key]) === String(f.val);
      })
    );

    if (upperSql.includes("ORDER BY CREATEDAT DESC")) {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return [results, []];
  }

  // ── INSERT user ───────────────────────────────────────────────
  if (upperSql.startsWith("INSERT INTO USERS")) {
    const newUserId = params[0].toUpperCase();

    // Enforce unique userId across all roles (global uniqueness)
    const duplicate = db.users.find(
      (u) => u.userId.toUpperCase() === newUserId
    );
    if (duplicate) {
      // Mimic MySQL ER_DUP_ENTRY so the application error handler catches it
      const err = new Error(`Duplicate entry '${newUserId}' for key 'users.idx_userId'`);
      err.code = "ER_DUP_ENTRY";
      throw err;
    }

    const nextId = db.users.reduce((max, u) => (u.id > max ? u.id : max), 0) + 1;
    const newUser = {
      id: nextId,
      userId: newUserId,
      name: params[1],
      email: params[2],
      password: params[3],
      role: params[4],
      status: params[5],
      canteen: params[6] || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb(db);
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // ── UPDATE user ───────────────────────────────────────────────
  if (upperSql.startsWith("UPDATE USERS")) {
    const id = parseInt(params[params.length - 1], 10);
    const user = db.users.find((u) => u.id === id);
    if (user) {
      if (upperSql.includes("SET STATUS = ?")) {
        user.status = params[0];
      } else {
        let pIdx = 0;
        if (normalizedSql.includes("`name` = ?"))     user.name     = params[pIdx++];
        if (normalizedSql.includes("`email` = ?"))    user.email    = params[pIdx++];
        if (normalizedSql.includes("`status` = ?"))   user.status   = params[pIdx++];
        if (normalizedSql.includes("`canteen` = ?"))  user.canteen  = params[pIdx++];
        if (normalizedSql.includes("`password` = ?")) user.password = params[pIdx++];
      }
      user.updatedAt = new Date().toISOString();
      saveDb(db);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // ── DELETE user ───────────────────────────────────────────────
  if (upperSql.startsWith("DELETE FROM USERS")) {
    const id = parseInt(params[0], 10);
    db.users = db.users.filter((u) => u.id !== id);
    saveDb(db);
    return [{ affectedRows: 1 }, []];
  }

  return null;
}

// ── Refresh tokens ────────────────────────────────────────────────

function handleRefreshTokens(db, saveDb, upperSql, normalizedSql, params) {
  // INSERT refresh_tokens
  if (upperSql.startsWith("INSERT INTO REFRESH_TOKENS")) {
    if (!db.refresh_tokens) db.refresh_tokens = [];
    const nextId =
      db.refresh_tokens.reduce((max, t) => (t.id > max ? t.id : max), 0) + 1;
    const newRecord = {
      id: nextId,
      userId: params[0],
      token: params[1],
      expiresAt: params[2],
      createdAt: new Date().toISOString()
    };
    db.refresh_tokens.push(newRecord);
    saveDb(db);
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // SELECT refresh_tokens
  if (upperSql.startsWith("SELECT * FROM REFRESH_TOKENS")) {
    if (!db.refresh_tokens) db.refresh_tokens = [];
    let results = [...db.refresh_tokens];
    if (normalizedSql.includes("token = ?")) {
      results = results.filter((t) => t.token === params[0]);
    }
    return [results, []];
  }

  // DELETE refresh_tokens
  if (upperSql.startsWith("DELETE FROM REFRESH_TOKENS")) {
    if (!db.refresh_tokens) db.refresh_tokens = [];
    const beforeCount = db.refresh_tokens.length;
    if (normalizedSql.includes("token = ?")) {
      db.refresh_tokens = db.refresh_tokens.filter((t) => t.token !== params[0]);
    } else if (normalizedSql.includes("userId = ?")) {
      db.refresh_tokens = db.refresh_tokens.filter((t) => t.userId !== params[0]);
    }
    saveDb(db);
    return [{ affectedRows: beforeCount - db.refresh_tokens.length }, []];
  }

  return null;
}

module.exports = { handleUsers, handleRefreshTokens };
