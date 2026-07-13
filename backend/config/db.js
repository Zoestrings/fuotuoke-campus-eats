// Database configuration and mock DB fallback emulator

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "database.json");
let useMock = false;

// ── Mock Database Operations Helper ─────────────────────────────
function loadDb() {
  if (!fs.existsSync(dbPath)) {
    const initialDb = {
      users: [
        { id: 1, userId: "zoehackz001", name: "Zoe Hackz Admin", email: "admin@fuotuoke.edu.ng", password: "$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2", role: "admin", status: "active", canteen: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 2, userId: "FUO/22/CSI/18843", name: "Precious Daniel", email: "precious.daniel@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "student", status: "active", canteen: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 3, userId: "zoehackz001", name: "Zoe Hackz Rider", email: "rider@fuotuoke.edu.ng", password: "$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2", role: "rider", status: "active", canteen: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 4, userId: "zoehackz001", name: "Main Cafeteria Kitchen", email: "canteen@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "kitchen", status: "active", canteen: "Main Cafeteria", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 5, userId: "SCIENCE-KITCHEN", name: "Science Cafeteria Kitchen", email: "science@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "kitchen", status: "active", canteen: "Science Cafeteria", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 6, userId: "SUB-KITCHEN", name: "Student Union Buka Kitchen", email: "sub@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "kitchen", status: "active", canteen: "Student Union Buka", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 7, userId: "ENG-KITCHEN", name: "Engineering Canteen Kitchen", email: "eng@fuotuoke.edu.ng", password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq", role: "kitchen", status: "active", canteen: "Engineering Canteen", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 8, userId: "zoehackz001", name: "Zoe Hackz Staff", email: "staff@fuotuoke.edu.ng", password: "$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2", role: "staff", status: "active", canteen: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
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
      audit_logs: [],
      refresh_tokens: []
    };
    saveDb(initialDb);
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving mock database:", e);
  }
}

async function executeMockQuery(sql, params = []) {
  const db = loadDb();
  const normalizedSql = sql.trim().replace(/\s+/g, " ");
  const upperSql = normalizedSql.toUpperCase();

  // 1. SELECT Settings
  if (upperSql.includes("SELECT * FROM SETTINGS WHERE ID = 1") || upperSql.includes("SELECT * FROM SETTINGS WHERE ID=1")) {
    return [db.settings.filter(s => s.id === 1), []];
  }
  
  // 2. INSERT settings
  if (upperSql.startsWith("INSERT INTO SETTINGS")) {
    return [{ insertId: 1 }, []];
  }
  
  // 3. UPDATE settings
  if (upperSql.startsWith("UPDATE SETTINGS")) {
    const settings = db.settings[0] || { id: 1 };
    settings.maintenanceMode = params[0];
    settings.allowRegistration = params[1];
    settings.allowDeliveries = params[2];
    settings.deliveryFee = parseFloat(params[3]);
    settings.supportPhone = params[4];
    settings.updatedAt = new Date().toISOString();
    db.settings[0] = settings;
    saveDb(db);
    return [{ affectedRows: 1 }, []];
  }

  // 4. SELECT users
  if (upperSql.startsWith("SELECT * FROM USERS")) {
    let results = [...db.users];
    
    if (normalizedSql.includes("id = ?")) {
      const idVal = params[params.length - 1];
      let paramIdx = 0;
      const filters = [];
      if (normalizedSql.includes("AND id = ?")) filters.push({ key: "id", val: params[paramIdx++] });
      if (normalizedSql.includes("AND userId = ?")) filters.push({ key: "userId", val: params[paramIdx++] });
      if (normalizedSql.includes("AND role = ?")) filters.push({ key: "role", val: params[paramIdx++] });
      if (normalizedSql.includes("AND email = ?")) filters.push({ key: "email", val: params[paramIdx++] });
      if (normalizedSql.includes("AND status = ?")) filters.push({ key: "status", val: params[paramIdx++] });
      
      results = results.filter(row => {
        return filters.every(f => {
          if (f.key === "userId" || f.key === "email") {
            return String(row[f.key]).trim().toLowerCase() === String(f.val).trim().toLowerCase();
          }
          return String(row[f.key]) === String(f.val);
        });
      });
    } else {
      let paramIdx = 0;
      const filters = [];
      if (normalizedSql.includes("AND id = ?")) filters.push({ key: "id", val: params[paramIdx++] });
      if (normalizedSql.includes("AND userId = ?")) filters.push({ key: "userId", val: params[paramIdx++] });
      if (normalizedSql.includes("AND role = ?")) filters.push({ key: "role", val: params[paramIdx++] });
      if (normalizedSql.includes("AND email = ?")) filters.push({ key: "email", val: params[paramIdx++] });
      if (normalizedSql.includes("AND status = ?")) filters.push({ key: "status", val: params[paramIdx++] });
      
      results = results.filter(row => {
        return filters.every(f => {
          if (f.key === "userId" || f.key === "email") {
            return String(row[f.key]).trim().toLowerCase() === String(f.val).trim().toLowerCase();
          }
          return String(row[f.key]) === String(f.val);
        });
      });
    }
    
    if (upperSql.includes("ORDER BY CREATEDAT DESC")) {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [results, []];
  }

  // 5. INSERT user
  if (upperSql.startsWith("INSERT INTO USERS")) {
    const nextId = db.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
    const newUser = {
      id: nextId,
      userId: params[0].toUpperCase(),
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

  // 6. UPDATE user
  if (upperSql.startsWith("UPDATE USERS")) {
    const id = parseInt(params[params.length - 1], 10);
    const user = db.users.find(u => u.id === id);
    if (user) {
      if (upperSql.includes("SET STATUS = ?")) {
        user.status = params[0];
      } else {
        let pIdx = 0;
        if (normalizedSql.includes("`name` = ?")) user.name = params[pIdx++];
        if (normalizedSql.includes("`email` = ?")) user.email = params[pIdx++];
        if (normalizedSql.includes("`status` = ?")) user.status = params[pIdx++];
        if (normalizedSql.includes("`canteen` = ?")) user.canteen = params[pIdx++];
        if (normalizedSql.includes("`password` = ?")) user.password = params[pIdx++];
      }
      user.updatedAt = new Date().toISOString();
      saveDb(db);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 7. DELETE user
  if (upperSql.startsWith("DELETE FROM USERS")) {
    const id = parseInt(params[0], 10);
    db.users = db.users.filter(u => u.id !== id);
    saveDb(db);
    return [{ affectedRows: 1 }, []];
  }

  // 8. SELECT menu_items
  if (upperSql.startsWith("SELECT * FROM MENU_ITEMS")) {
    let results = [...db.menu_items];
    if (normalizedSql.includes("id = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter(item => item.id === id);
    } else {
      let paramIdx = 0;
      const filters = [];
      if (normalizedSql.includes("AND cat = ?")) filters.push({ key: "cat", val: params[paramIdx++] });
      if (normalizedSql.includes("AND available = ?")) filters.push({ key: "available", val: params[paramIdx++] });
      results = results.filter(row => filters.every(f => String(row[f.key]) === String(f.val)));
    }
    return [results, []];
  }

  // 9. SELECT menu_extras
  if (upperSql.startsWith("SELECT * FROM MENU_EXTRAS")) {
    let results = [...db.menu_extras];
    if (upperSql.includes("MENUITEMID IN (?)") || upperSql.includes("MENUITEMID IN ?")) {
      const ids = Array.isArray(params[0]) ? params[0] : [params[0]];
      results = results.filter(e => ids.includes(e.menuItemId));
    } else if (normalizedSql.includes("menuItemId = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter(e => e.menuItemId === id);
    }
    return [results, []];
  }

  // 10. INSERT menu_items
  if (upperSql.startsWith("INSERT INTO MENU_ITEMS")) {
    const nextId = db.menu_items.reduce((max, m) => m.id > max ? m.id : max, 0) + 1;
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

  // 11. INSERT menu_extras
  if (upperSql.startsWith("INSERT INTO MENU_EXTRAS")) {
    const values = params[0];
    if (Array.isArray(values)) {
      values.forEach(v => {
        const nextId = db.menu_extras.reduce((max, e) => e.id > max ? e.id : max, 0) + 1;
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

  // 12. UPDATE menu_items
  if (upperSql.startsWith("UPDATE MENU_ITEMS")) {
    const id = parseInt(params[params.length - 1], 10);
    const item = db.menu_items.find(m => m.id === id);
    if (item) {
      let pIdx = 0;
      if (normalizedSql.includes("`name` = ?")) item.name = params[pIdx++];
      if (normalizedSql.includes("`price` = ?")) item.price = parseFloat(params[pIdx++]);
      if (normalizedSql.includes("`cat` = ?")) item.cat = params[pIdx++];
      if (normalizedSql.includes("`emoji` = ?")) item.emoji = params[pIdx++];
      if (normalizedSql.includes("`image` = ?")) item.image = params[pIdx++];
      if (normalizedSql.includes("`desc` = ?")) item.desc = params[pIdx++];
      if (normalizedSql.includes("`popular` = ?")) item.popular = params[pIdx++] ? 1 : 0;
      if (normalizedSql.includes("`available` = ?")) item.available = params[pIdx++] ? 1 : 0;
      item.updatedAt = new Date().toISOString();
      saveDb(db);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 13. DELETE menu_extras
  if (upperSql.startsWith("DELETE FROM MENU_EXTRAS")) {
    const menuItemId = parseInt(params[0], 10);
    db.menu_extras = db.menu_extras.filter(e => e.menuItemId !== menuItemId);
    saveDb(db);
    return [{ affectedRows: 1 }, []];
  }

  // 14. DELETE menu_items
  if (upperSql.startsWith("DELETE FROM MENU_ITEMS")) {
    const id = parseInt(params[0], 10);
    db.menu_items = db.menu_items.filter(m => m.id !== id);
    db.menu_extras = db.menu_extras.filter(e => e.menuItemId !== id);
    saveDb(db);
    return [{ affectedRows: 1 }, []];
  }

  // 15. SELECT orders
  if (upperSql.startsWith("SELECT * FROM ORDERS")) {
    let results = [...db.orders];
    if (normalizedSql.includes("id = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter(o => o.id === id);
    } else {
      if (normalizedSql.includes("assignedRiderId = ? OR")) {
        const riderId = params[0];
        results = results.filter(o => {
          return o.assignedRiderId === riderId || 
                 (!o.assignedRiderId && o.type === "delivery" && ["Preparing", "Ready", "Received", "Completed"].includes(o.status));
        });
      } else {
        let pIdx = 0;
        const filters = [];
        if (normalizedSql.includes("AND customerId = ?")) filters.push({ key: "customerId", val: params[pIdx++] });
        if (normalizedSql.includes("AND assignedRiderId = ?")) filters.push({ key: "assignedRiderId", val: params[pIdx++] });
        if (normalizedSql.includes("AND outletName = ?")) filters.push({ key: "outletName", val: params[pIdx++] });
        if (normalizedSql.includes("AND status = ?")) {
          filters.push({ key: "status", val: params[pIdx++] });
        } else if (normalizedSql.includes("AND status IN (?)")) {
          filters.push({ key: "status", val: params[pIdx++], isArray: true });
        }
        if (normalizedSql.includes("AND paymentStatus = ?")) filters.push({ key: "paymentStatus", val: params[pIdx++] });
        
        results = results.filter(o => {
          return filters.every(f => {
            if (f.isArray) {
              const checkArr = Array.isArray(f.val) ? f.val : [f.val];
              return checkArr.includes(o[f.key]);
            }
            return String(o[f.key]) === String(f.val);
          });
        });
      }
    }
    
    if (upperSql.includes("ORDER BY CREATEDAT DESC")) {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [results, []];
  }

  // 16. SELECT order_items
  if (upperSql.startsWith("SELECT * FROM ORDER_ITEMS")) {
    let results = [...db.order_items];
    if (upperSql.includes("ORDERID IN (?)") || upperSql.includes("ORDERID IN ?")) {
      const ids = Array.isArray(params[0]) ? params[0] : [params[0]];
      results = results.filter(item => ids.includes(item.orderId));
    } else if (normalizedSql.includes("orderId = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter(item => item.orderId === id);
    }
    return [results, []];
  }

  // 17. SELECT order_item_extras
  if (upperSql.startsWith("SELECT * FROM ORDER_ITEM_EXTRAS")) {
    let results = [...db.order_item_extras];
    if (upperSql.includes("ORDERITEMID IN (?)") || upperSql.includes("ORDERITEMID IN ?")) {
      const ids = Array.isArray(params[0]) ? params[0] : [params[0]];
      results = results.filter(e => ids.includes(e.orderItemId));
    } else if (normalizedSql.includes("orderItemId = ?")) {
      const id = parseInt(params[0], 10);
      results = results.filter(e => e.orderItemId === id);
    }
    return [results, []];
  }

  // 18. INSERT orders
  if (upperSql.startsWith("INSERT INTO ORDERS")) {
    const nextId = db.orders.reduce((max, o) => o.id > max ? o.id : max, 0) + 1;
    const newOrder = {
      id: nextId,
      total: parseFloat(params[0]),
      outletName: params[1],
      outletId: params[2] || null,
      type: params[3],
      faculty: params[4] || null,
      status: params[5],
      customerId: params[6],
      customerName: params[7],
      paymentRef: params[8] || null,
      paymentStatus: params[9] || "pending",
      time: params[10],
      assignedRiderId: null,
      assignedRiderName: null,
      assignedRiderPhone: null,
      deliveryProgress: 0,
      riderLatitude: null,
      riderLongitude: null,
      rating: 0,
      review: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    saveDb(db);
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // 19. INSERT order_items
  if (upperSql.startsWith("INSERT INTO ORDER_ITEMS")) {
    const nextId = db.order_items.reduce((max, i) => i.id > max ? i.id : max, 0) + 1;
    const newItem = {
      id: nextId,
      orderId: parseInt(params[0], 10),
      menuItemId: params[1] ? parseInt(params[1], 10) : null,
      name: params[2],
      price: parseFloat(params[3]),
      qty: parseInt(params[4], 10),
      emoji: params[5] || ""
    };
    db.order_items.push(newItem);
    saveDb(db);
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // 20. INSERT order_item_extras
  if (upperSql.startsWith("INSERT INTO ORDER_ITEM_EXTRAS")) {
    const values = params[0];
    if (Array.isArray(values)) {
      values.forEach(v => {
        const nextId = db.order_item_extras.reduce((max, e) => e.id > max ? e.id : max, 0) + 1;
        db.order_item_extras.push({
          id: nextId,
          orderItemId: parseInt(v[0], 10),
          name: v[1],
          price: parseFloat(v[2])
        });
      });
      saveDb(db);
    }
    return [{ affectedRows: values ? values.length : 0 }, []];
  }

  // 21. UPDATE orders
  if (upperSql.startsWith("UPDATE ORDERS")) {
    const id = parseInt(params[params.length - 1], 10);
    const order = db.orders.find(o => o.id === id);
    if (order) {
      if (upperSql.includes("SET STATUS = ?")) {
        order.status = params[0];
        order.paymentStatus = params[1];
        order.paymentRef = params[2];
        order.assignedRiderId = params[3];
        order.assignedRiderName = params[4];
        order.assignedRiderPhone = params[5];
        order.deliveryProgress = parseInt(params[6], 10);
        order.rating = parseInt(params[7], 10);
        order.review = params[8];
      } else {
        let pIdx = 0;
        if (normalizedSql.includes("status = ?")) order.status = params[pIdx++];
        if (normalizedSql.includes("paymentStatus = ?")) order.paymentStatus = params[pIdx++];
        if (normalizedSql.includes("paymentRef = ?")) order.paymentRef = params[pIdx++];
        if (normalizedSql.includes("assignedRiderId = ?")) order.assignedRiderId = params[pIdx++];
        if (normalizedSql.includes("assignedRiderName = ?")) order.assignedRiderName = params[pIdx++];
        if (normalizedSql.includes("assignedRiderPhone = ?")) order.assignedRiderPhone = params[pIdx++];
        if (normalizedSql.includes("deliveryProgress = ?")) order.deliveryProgress = parseInt(params[pIdx++], 10);
        if (normalizedSql.includes("rating = ?")) order.rating = parseInt(params[pIdx++], 10);
        if (normalizedSql.includes("review = ?")) order.review = params[pIdx++];
      }
      order.updatedAt = new Date().toISOString();
      saveDb(db);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 22. INSERT audit_logs
  if (upperSql.startsWith("INSERT INTO AUDIT_LOGS")) {
    const nextId = db.audit_logs.reduce((max, l) => l.id > max ? l.id : max, 0) + 1;
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

  // 23. SELECT audit_logs
  if (upperSql.startsWith("SELECT * FROM AUDIT_LOGS")) {
    let results = [...db.audit_logs];
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [results.slice(0, 100), []];
  }

  // 24. INSERT refresh_tokens
  if (upperSql.startsWith("INSERT INTO REFRESH_TOKENS")) {
    if (!db.refresh_tokens) db.refresh_tokens = [];
    const nextId = db.refresh_tokens.reduce((max, t) => t.id > max ? t.id : max, 0) + 1;
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

  // 25. SELECT refresh_tokens
  if (upperSql.startsWith("SELECT * FROM REFRESH_TOKENS")) {
    if (!db.refresh_tokens) db.refresh_tokens = [];
    let results = [...db.refresh_tokens];
    if (normalizedSql.includes("token = ?")) {
      const tokenVal = params[0];
      results = results.filter(t => t.token === tokenVal);
    }
    return [results, []];
  }

  // 26. DELETE refresh_tokens
  if (upperSql.startsWith("DELETE FROM REFRESH_TOKENS")) {
    if (!db.refresh_tokens) db.refresh_tokens = [];
    const beforeCount = db.refresh_tokens.length;
    if (normalizedSql.includes("token = ?")) {
      const tokenVal = params[0];
      db.refresh_tokens = db.refresh_tokens.filter(t => t.token !== tokenVal);
    } else if (normalizedSql.includes("userId = ?")) {
      const userIdVal = params[0];
      db.refresh_tokens = db.refresh_tokens.filter(t => t.userId !== userIdVal);
    }
    saveDb(db);
    const affected = beforeCount - db.refresh_tokens.length;
    return [{ affectedRows: affected }, []];
  }

  return [{ affectedRows: 0 }, []];
}

// Mock Connection object for getConnection()
const mockConnection = {
  query: executeMockQuery,
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => {},
  release: () => {}
};

// ── Proxy Connection Pool Interface ─────────────────────────────
const pool = {
  query: async (sql, params) => {
    if (useMock) {
      return executeMockQuery(sql, params);
    }
    try {
      return await realPool.query(sql, params);
    } catch (err) {
      console.warn("⚠️ MySQL query failed, falling back to mock database:", err.message);
      useMock = true;
      return executeMockQuery(sql, params);
    }
  },
  getConnection: async () => {
    if (useMock) {
      return mockConnection;
    }
    try {
      const conn = await realPool.getConnection();
      const originalRelease = conn.release;
      conn.release = function() {
        if (originalRelease) originalRelease.apply(conn, arguments);
      };
      return conn;
    } catch (err) {
      console.warn("⚠️ MySQL getConnection failed, falling back to mock database connection:", err.message);
      useMock = true;
      return mockConnection;
    }
  }
};

const realPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fuotuoke_campus_eats",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
});

const connectDB = async () => {
  try {
    const connection = await realPool.getConnection();
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
    console.warn(`⚠️ MySQL server connection failed (${error.message}). Booting with JSON file database fallback.`);
    useMock = true;
    loadDb(); // Ensure initialization
  }
};

connectDB.pool = pool;

module.exports = connectDB;
