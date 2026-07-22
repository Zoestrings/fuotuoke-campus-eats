// ================================================================
// FUOTUOKE Campus Eats — Hybrid Database Seeder
// Run: npm run seed
//
// Behaviour:
//   1. Tries to seed MySQL (always).
//   2. Falls back to JSON mock DB ONLY when NODE_ENV=development.
//      Production environments must have MySQL available.
// ================================================================

require("dotenv").config();

const mysql = require("mysql2/promise");
const fs    = require("fs");
const path  = require("path");

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const seedDatabase = async () => {
  console.log("⚡ Starting database seeder...");
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);

  const dbPath     = path.join(__dirname, "config", "database.json");
  const schemaPath = path.join(__dirname, "config", "schema.sql");

  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ DDL Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  try {
    // ── 1. Seed MySQL ──────────────────────────────────────────
    const connection = await mysql.createConnection({
      host:               process.env.DB_HOST     || "localhost",
      user:               process.env.DB_USER     || "root",
      password:           process.env.DB_PASSWORD || "",
      port:               parseInt(process.env.DB_PORT || "3306", 10),
      multipleStatements: true
    });

    const sql = fs.readFileSync(schemaPath, "utf8");
    console.log("⏳ Executing MySQL DDL schema and seeding script...");
    await connection.query(sql);
    console.log("✅ MySQL database tables created and pre-seeded successfully!");
    await connection.end();
    process.exit(0);

  } catch (error) {
    console.warn(`⚠️  MySQL seeder failed: ${error.message}`);

    // ── 2. Production: hard stop — never use JSON mock ─────────
    if (IS_PRODUCTION) {
      console.error("❌ FATAL: Cannot seed JSON mock database in production.");
      console.error("   Ensure MySQL is accessible and retry.");
      process.exit(1);
    }

    // ── 3. Development only: fall back to JSON mock database ───
    console.warn("   Seeding JSON mock database fallback (development only)...");

    try {
      // Import canonical seed data (all userIds are unique, hashes unchanged)
      const buildInitialDb = require("./config/mock/seed");
      const initialDb      = buildInitialDb();

      fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), "utf8");
      console.log("✅ JSON mock database created and pre-seeded successfully!");
      console.log("");
      console.log("   Development login credentials:");
      console.log("   ┌─────────────────┬──────────────────────────────────────┬────────────────┐");
      console.log("   │ Role            │ Email                                │ userId         │");
      console.log("   ├─────────────────┼──────────────────────────────────────┼────────────────┤");
      console.log("   │ admin           │ admin@fuotuoke.edu.ng                │ ZOEHACKZ001    │");
      console.log("   │ rider           │ rider@fuotuoke.edu.ng                │ FUO-RIDER-001  │");
      console.log("   │ staff           │ staff@fuotuoke.edu.ng                │ FUO-STAFF-001  │");
      console.log("   │ kitchen         │ canteen@fuotuoke.edu.ng              │ MAIN-KITCHEN   │");
      console.log("   └─────────────────┴──────────────────────────────────────┴────────────────┘");
      console.log("   Password for admin/rider/staff: 72364231Zoe@");
      process.exit(0);
    } catch (e) {
      console.error(`❌ JSON seeding failed: ${e.message}`);
      process.exit(1);
    }
  }
};

seedDatabase();
