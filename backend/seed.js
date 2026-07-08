// ================================================================
// FUOTUOKE Campus Eats — Hybrid Database Seeder (MySQL / JSON Fallback)
// Run: npm run seed
// ================================================================

require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const seedDatabase = async () => {
  console.log("⚡ Starting database seeder...");
  
  const dbPath = path.join(__dirname, "config", "database.json");
  const schemaPath = path.join(__dirname, "config", "schema.sql");
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ DDL Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  try {
    // 1. Try to seed MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      multipleStatements: true
    });

    const sql = fs.readFileSync(schemaPath, "utf8");
    console.log("⏳ Executing MySQL DDL schema and seeding script...");
    await connection.query(sql);
    console.log("✅ MySQL Database tables created and pre-seeded successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.warn(`⚠️ MySQL seeder failed (${error.message}). Seeding mock JSON database fallback...`);
    
    // 2. Fallback to mock JSON database seeding
    try {
      const initialDb = {
        users: [
          { id: 1, userId: "zoehackz001", name: "Zoe Hackz Admin", email: "admin@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "admin", status: "active", canteen: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 2, userId: "FUO/22/CSI/18843", name: "Precious Daniel", email: "precious.daniel@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "student", status: "active", canteen: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 3, userId: "zoehackz001", name: "Zoe Hackz Rider", email: "rider@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "rider", status: "active", canteen: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 4, userId: "zoehackz001", name: "Main Cafeteria Kitchen", email: "canteen@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "kitchen", status: "active", canteen: "Main Cafeteria", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 5, userId: "SCIENCE-KITCHEN", name: "Science Cafeteria Kitchen", email: "science@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "kitchen", status: "active", canteen: "Science Cafeteria", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 6, userId: "SUB-KITCHEN", name: "Student Union Buka Kitchen", email: "sub@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "kitchen", status: "active", canteen: "Student Union Buka", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 7, userId: "ENG-KITCHEN", name: "Engineering Canteen Kitchen", email: "eng@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "kitchen", status: "active", canteen: "Engineering Canteen", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        menu_items: [
          { id: 1, name: "Eba + soup (Egusi/Vegetable)", price: 1500.00, cat: "Soup", emoji: "", image: "/images/menu/eba_egusi_soup.png", desc: "Fresh garri served with choice of Egusi or Vegetable soup", popular: 1, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 2, name: "Eba + Okra soup", price: 1500.00, cat: "Soup", emoji: "", image: "/images/menu/eba_okra_soup.png", desc: "Yellow garri paired with draw okra soup and fish", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 3, name: "Amala + Ewedu/Gbegiri", price: 1700.00, cat: "Soup", emoji: "", image: "/images/menu/amala_ewedu.png", desc: "Soft yam flour with combination of Ewedu and bean soup", popular: 1, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 4, name: "Pounded yam + soup", price: 1700.00, cat: "Soup", emoji: "", image: "/images/menu/pounded_yam_soup.png", desc: "Smooth pounded yam served with choice of soup", popular: 1, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 5, name: "Pepper soup (fish)", price: 2500.00, cat: "Soup", emoji: "", image: "/images/menu/pepper_soup_fish.png", desc: "Spicy pepper soup broth served with fresh catfish", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 6, name: "Jollof Rice & Chicken", price: 2500.00, cat: "Rice", emoji: "", image: "/images/menu/jollof_rice_chicken.png", desc: "Rich smokey Nigerian party Jollof served with fried chicken", popular: 1, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 7, name: "Fried Rice & Fish", price: 2500.00, cat: "Rice", emoji: "", image: "/images/menu/fried_rice_chicken.png", desc: "Savory seasoned fried rice mixed with vegetables and fried fish", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 8, name: "White Rice & Stew", price: 1800.00, cat: "Rice", emoji: "", image: "/images/menu/white_rice_stew.png", desc: "Fluffy white long-grain rice served with standard tomato stew and beef", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 9, name: "Spaghetti Bolognese", price: 2000.00, cat: "Mains", emoji: "", image: "/images/menu/spaghetti_chicken.png", desc: "Pasta tossed in seasoned minced beef sauce", popular: 1, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 10, name: "Plantain & Egg Sauce", price: 1500.00, cat: "Mains", emoji: "", image: "/images/menu/fried_plantain.png", desc: "Fried sweet plantain slices served with scrambled egg sauce", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 11, name: "Meat Pie", price: 800.00, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1588168333986-5078647ac9ab?auto=format&fit=crop&w=600&q=80", desc: "Baked pastry filled with minced beef and potatoes", popular: 1, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 12, name: "Sausage Roll", price: 600.00, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80", desc: "Savory sausage meat rolled in flaky pastry", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 13, name: "Chilled Coca-Cola", price: 500.00, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80", desc: "35cl pet bottle served ice-cold", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 14, name: "Cold Fanta", price: 500.00, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1581009137042-c552e4856c7d?auto=format&fit=crop&w=600&q=80", desc: "35cl pet bottle served ice-cold", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 15, name: "Water (Bottle)", price: 300.00, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1560023907-5f67b3104e94?auto=format&fit=crop&w=600&q=80", desc: "75cl pure table water bottle", popular: 0, available: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        menu_extras: [
          { id: 1, menuItemId: 1, name: "Extra Beef", price: 500.00 },
          { id: 2, menuItemId: 1, name: "Extra Eba", price: 200.00 },
          { id: 3, menuItemId: 2, name: "Extra Fish", price: 500.00 },
          { id: 4, menuItemId: 2, name: "Extra Eba", price: 200.00 },
          { id: 5, menuItemId: 3, name: "Extra Meat", price: 500.00 },
          { id: 6, menuItemId: 3, name: "Extra Amala", price: 300.00 },
          { id: 7, menuItemId: 4, name: "Extra Meat", price: 500.00 },
          { id: 8, menuItemId: 4, name: "Extra Yam", price: 300.00 },
          { id: 9, menuItemId: 6, name: "Extra Chicken", price: 1000.00 },
          { id: 10, menuItemId: 6, name: "Plantain portion", price: 300.00 },
          { id: 11, menuItemId: 7, name: "Extra Fish", price: 800.00 },
          { id: 12, menuItemId: 7, name: "Coleslaw side", price: 200.00 }
        ],
        orders: [],
        order_items: [],
        order_item_extras: [],
        settings: [
          { id: 1, maintenanceMode: 0, allowRegistration: 1, allowDeliveries: 1, deliveryFee: 300.00, supportPhone: "08012345678", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        audit_logs: []
      };
      fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), "utf8");
      console.log("✅ JSON database fallback created and pre-seeded successfully!");
      process.exit(0);
    } catch (e) {
      console.error(`❌ JSON seeding failed: ${e.message}`);
      process.exit(1);
    }
  }
};

seedDatabase();
