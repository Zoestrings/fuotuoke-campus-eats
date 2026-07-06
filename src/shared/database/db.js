// ================================================================
// FUOTUOKE Campus Eats — Mock Database Layer (db.js)
// ================================================================

import { MENU } from "../../data";

class Database {
  constructor() {
    this.DB_VERSION = "v3"; // bump this whenever seed data changes
    this.init();
  }

  init() {
    // Clear and re-seed if DB version has changed (e.g. credentials updated)
    const storedVersion = localStorage.getItem("fuo_db_version");
    if (storedVersion !== this.DB_VERSION) {
      ["users", "menuItems", "orders", "auditLogs", "settings"].forEach(key => {
        localStorage.removeItem(`fuo_${key}`);
      });
      localStorage.setItem("fuo_db_version", this.DB_VERSION);
    }

    // Initialize collections if they don't exist in LocalStorage
    this._initCollection("users", this.getDefaultUsers());
    this._initCollection("menuItems", MENU);
    this._initCollection("orders", this.getDefaultOrders());
    this._initCollection("auditLogs", this.getDefaultLogs());
    this._initCollection("settings", this.getDefaultSettings());

    // Ensure menuItems collection matches the new list if it still contains old items
    const items = this.getCollection("menuItems");
    const hasOldItems = items.some(i => i.price === 2000 && i.name === "Jollof Rice & Chicken");
    if (hasOldItems || items.length === 0) {
      this.saveCollection("menuItems", MENU);
    }

    // Ensure the new default student user FUO/22/CSI/18843 exists in local database
    const users = this.getCollection("users");
    const exists = users.some(u => u.id.toUpperCase() === "FUO/22/CSI/18843");
    if (!exists) {
      users.push({
        id: "FUO/22/CSI/18843",
        role: "student",
        name: "Precious Daniel",
        email: "precious.daniel@fuotuoke.edu.ng",
        password: "Password123!",
        status: "active",
        createdAt: new Date().toLocaleDateString()
      });
      this.saveCollection("users", users);
    }
  }

  _initCollection(name, defaultData) {
    if (!localStorage.getItem(`fuo_${name}`)) {
      localStorage.setItem(`fuo_${name}`, JSON.stringify(defaultData));
    }
  }

  getCollection(name) {
    const data = localStorage.getItem(`fuo_${name}`);
    return data ? JSON.parse(data) : [];
  }

  saveCollection(name, data) {
    localStorage.setItem(`fuo_${name}`, JSON.stringify(data));
  }

  find(name, query = {}) {
    const items = this.getCollection(name);
    return items.filter(item => {
      for (const key in query) {
        const val1 = item[key];
        const val2 = query[key];
        if (typeof val1 === "string" && typeof val2 === "string") {
          if (val1.toLowerCase() !== val2.toLowerCase()) return false;
        } else {
          if (val1 !== val2) return false;
        }
      }
      return true;
    });
  }

  findOne(name, query = {}) {
    const items = this.getCollection(name);
    return items.find(item => {
      for (const key in query) {
        const val1 = item[key];
        const val2 = query[key];
        if (typeof val1 === "string" && typeof val2 === "string") {
          if (val1.toLowerCase() !== val2.toLowerCase()) return false;
        } else {
          if (val1 !== val2) return false;
        }
      }
      return true;
    }) || null;
  }

  insert(name, item) {
    const items = this.getCollection(name);
    const newItem = { id: Date.now(), ...item };
    items.unshift(newItem); // Insert at the beginning (recent items first)
    this.saveCollection(name, items);
    return newItem;
  }

  update(name, query, updates) {
    const items = this.getCollection(name);
    let updatedCount = 0;
    const newItems = items.map(item => {
      let matches = true;
      for (const key in query) {
        const val1 = item[key];
        const val2 = query[key];
        const matchesField = (typeof val1 === "string" && typeof val2 === "string")
          ? (val1.toLowerCase() === val2.toLowerCase())
          : (val1 === val2);
        if (!matchesField) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return { ...item, ...updates };
      }
      return item;
    });
    this.saveCollection(name, newItems);
    return updatedCount;
  }

  delete(name, query) {
    const items = this.getCollection(name);
    const newItems = items.filter(item => {
      let matches = true;
      for (const key in query) {
        const val1 = item[key];
        const val2 = query[key];
        const matchesField = (typeof val1 === "string" && typeof val2 === "string")
          ? (val1.toLowerCase() === val2.toLowerCase())
          : (val1 === val2);
        if (!matchesField) {
          matches = false;
          break;
        }
      }
      return !matches;
    });
    this.saveCollection(name, newItems);
    return items.length - newItems.length;
  }

  // Seed Data generators
  getDefaultUsers() {
    return [
      {
        id: "FUO/22/CSI/18842",
        role: "student",
        name: "Emeka Okafor",
        email: "emeka.okafor@fuotuoke.edu.ng",
        password: "Password123!",
        status: "active",
        createdAt: new Date().toLocaleDateString()
      },
      {
        id: "FUO/22/CSI/18843",
        role: "student",
        name: "Precious Daniel",
        email: "precious.daniel@fuotuoke.edu.ng",
        password: "Password123!",
        status: "active",
        createdAt: new Date().toLocaleDateString()
      },
      {
        id: "FUO-STAFF-0042",
        role: "staff",
        name: "Ahmed Bello",
        email: "ahmed.bello@fuotuoke.edu.ng",
        password: "Password123!",
        status: "active",
        createdAt: new Date().toLocaleDateString()
      },
      {
        id: "Zoehackz001",
        role: "kitchen",
        name: "Main Cafeteria Kitchen",
        email: "main.kitchen@fuotuoke.edu.ng",
        password: "72364231",
        status: "active",
        canteen: "Main Cafeteria",
        createdAt: new Date().toLocaleDateString()
      },
      {
        id: "Zoehackz001",
        role: "admin",
        name: "System Administrator",
        email: "admin@fuotuoke.edu.ng",
        password: "72364231",
        status: "active",
        createdAt: new Date().toLocaleDateString()
      }
    ];
  }

  getDefaultOrders() {
    return [
      {
        id: 1782978000000,
        items: [
          { id: 1, name: "Jollof Rice & Chicken", price: 2000, qty: 1, emoji: "🍛" }
        ],
        total: 2000,
        outlet: { name: "Main Cafeteria" },
        type: "pickup",
        faculty: null,
        status: "Completed",
        time: "12:30 PM",
        customerName: "Emeka Okafor",
        customerId: "FUO/22/CSI/18842"
      }
    ];
  }

  getDefaultLogs() {
    return [
      {
        id: 1,
        user: "System",
        action: "Database initialized",
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        ip: "127.0.0.1"
      }
    ];
  }

  getDefaultSettings() {
    return {
      maintenanceMode: false,
      allowRegistration: true,
      allowDeliveries: true,
      deliveryFee: 500,
      supportPhone: "080-3333-4444"
    };
  }
}

export const db = new Database();
