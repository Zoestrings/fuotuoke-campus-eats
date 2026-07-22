// ================================================================
// FUOTUOKE Campus Eats — Database Configuration
//
// Behaviour by environment:
//   development  → MySQL primary; JSON mock DB fallback on failure
//   production   → MySQL only; server exits if MySQL is unavailable
//
// Public interface (unchanged):
//   const connectDB = require('./config/db')
//   connectDB.pool.query(sql, params)
//   connectDB.pool.getConnection()
// ================================================================

const mysql  = require("mysql2/promise");
const fs     = require("fs");
const path   = require("path");

const { executeMockQuery } = require("./mock/index");
const buildInitialDb       = require("./mock/seed");

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const dbPath        = path.join(__dirname, "database.json");

// Tracks whether the mock fallback is currently active.
// Will always be false in production (server exits instead of falling back).
let useMock = false;

// ── JSON File DB Helpers ─────────────────────────────────────────

function loadDb() {
  if (!fs.existsSync(dbPath)) {
    const initialDb = buildInitialDb();
    saveDb(initialDb);
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("⚠️ Failed to parse database.json — re-initialising:", e.message);
    const initialDb = buildInitialDb();
    saveDb(initialDb);
    return initialDb;
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("❌ Error saving mock database:", e.message);
  }
}

// ── Mock Connection (used for getConnection() in mock mode) ──────

const mockConnection = {
  query: async (sql, params) => {
    const db = loadDb();
    return executeMockQuery(db, saveDb, sql, params);
  },
  beginTransaction: async () => {},
  commit:           async () => {},
  rollback:         async () => {},
  release:          ()       => {}
};

// ── Real MySQL Pool ──────────────────────────────────────────────

const realPool = mysql.createPool({
  host:               process.env.DB_HOST     || "localhost",
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",
  database:           process.env.DB_NAME     || "fuotuoke_campus_eats",
  port:               parseInt(process.env.DB_PORT || "3306", 10),
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit:    15,
  queueLimit:         0
});

// ── Proxy Pool — uniform interface for all models ────────────────
//
// In development:  MySQL first; silently falls back to JSON mock on error.
// In production:   MySQL only; any error is re-thrown to the caller.

const pool = {
  query: async (sql, params) => {
    if (useMock) {
      // Development mock mode active
      const db = loadDb();
      return executeMockQuery(db, saveDb, sql, params);
    }
    try {
      return await realPool.query(sql, params);
    } catch (err) {
      if (IS_PRODUCTION) {
        // Never silently degrade in production
        throw err;
      }
      console.warn("⚠️ MySQL query failed — falling back to JSON mock:", err.message);
      useMock = true;
      const db = loadDb();
      return executeMockQuery(db, saveDb, sql, params);
    }
  },

  getConnection: async () => {
    if (useMock) {
      return mockConnection;
    }
    try {
      const conn = await realPool.getConnection();
      return conn;
    } catch (err) {
      if (IS_PRODUCTION) {
        throw err;
      }
      console.warn("⚠️ MySQL getConnection failed — falling back to JSON mock:", err.message);
      useMock = true;
      return mockConnection;
    }
  }
};

// ── Startup Connection + Schema Init ────────────────────────────

const connectDB = async () => {
  try {
    const connection = await realPool.getConnection();
    console.log("✅ Established initial connection to MySQL server.");

    // Auto-create database & tables if they do not exist
    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf8");
      await connection.query(sql);
      console.log("✅ MySQL database 'fuotuoke_campus_eats' initialised.");
    }

    connection.release();
  } catch (error) {
    if (IS_PRODUCTION) {
      // Hard stop: never use mock data in production
      console.error("❌ FATAL: MySQL connection failed in production.");
      console.error(`   Reason: ${error.message}`);
      console.error("   The server cannot start without a MySQL connection in production.");
      console.error("   Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME correctly in your environment.");
      process.exit(1);
    }

    // Development only: fall back gracefully to JSON file DB
    console.warn(`⚠️ MySQL unavailable (${error.message}). Booting with JSON mock database (development only).`);
    useMock = true;
    loadDb(); // Ensure the file and seed data are initialised
  }
};

connectDB.pool = pool;

module.exports = connectDB;
