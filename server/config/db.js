// ================================================================
// FUOTUOKE Campus Eats — MySQL Connection Pool & Schema Initializer
// ================================================================

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
});

const connectDB = async () => {
  try {
    // First connection check
    const connection = await pool.getConnection();
    console.log("✅ Established initial connection to MySQL server.");
    
    // Auto-create database & tables if they do not exist
    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf8");
      await connection.query(sql);
      console.log("✅ MySQL Database 'fuotuoke_campus_eats' initialized with tables.");
    }
    
    connection.release();
  } catch (error) {
    console.error(`❌ MySQL initialization failed: ${error.message}`);
    process.exit(1);
  }
};

// Expose pool as a property on connectDB function to maintain server.js import compatibility
connectDB.pool = pool;

module.exports = connectDB;
