// ================================================================
// FUOTUOKE Campus Eats — Database Seeder (MySQL version)
// Run: npm run seed
// ================================================================

require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const seedDatabase = async () => {
  console.log("⚡ Starting database seeder...");
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      multipleStatements: true
    });

    const schemaPath = path.join(__dirname, "config", "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const sql = fs.readFileSync(schemaPath, "utf8");
    console.log("⏳ Executing DDL schema and seeding script...");
    await connection.query(sql);
    
    console.log("✅ Database tables created and pre-seeded successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
