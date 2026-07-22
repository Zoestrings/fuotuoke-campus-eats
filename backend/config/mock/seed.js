// ================================================================
// FUOTUOKE Campus Eats — Mock DB Canonical Seed Data
//
// IMPORTANT: Password hashes are NEVER changed here.
// Only userId values for rider/staff/kitchen were updated
// to be globally unique (were all "zoehackz001" before).
//
// Seed userId mapping:
//   Admin   → ZOEHACKZ001     (unchanged — login: 72364231Zoe@)
//   Rider   → FUO-RIDER-001   (was zoehackz001 — login: 72364231Zoe@)
//   Staff   → FUO-STAFF-001   (was zoehackz001 — login: 72364231Zoe@)
//   Kitchen → MAIN-KITCHEN    (was zoehackz001 — login: 72364231Zoe@)
// ================================================================

module.exports = function buildInitialDb() {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 1,
        userId: "ZOEHACKZ001",
        name: "Zoe Hackz Admin",
        email: "admin@fuotuoke.edu.ng",
        // bcrypt hash of "72364231Zoe@" (12 rounds) — DO NOT CHANGE
        password: "$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2",
        role: "admin",
        status: "active",
        canteen: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        userId: "FUO/22/CSI/18843",
        name: "Precious Daniel",
        email: "precious.daniel@fuotuoke.edu.ng",
        // bcrypt hash of student password — DO NOT CHANGE
        password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq",
        role: "student",
        status: "active",
        canteen: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        // Unique userId — was "zoehackz001" (duplicate). Password unchanged.
        userId: "FUO-RIDER-001",
        name: "Zoe Hackz Rider",
        email: "rider@fuotuoke.edu.ng",
        // bcrypt hash of "72364231Zoe@" (12 rounds) — DO NOT CHANGE
        password: "$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2",
        role: "rider",
        status: "active",
        canteen: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        // Unique userId — was "zoehackz001" (duplicate). Password unchanged.
        userId: "MAIN-KITCHEN",
        name: "Main Cafeteria Kitchen",
        email: "canteen@fuotuoke.edu.ng",
        // bcrypt hash of kitchen password — DO NOT CHANGE
        password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq",
        role: "kitchen",
        status: "active",
        canteen: "Main Cafeteria",
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        userId: "SCIENCE-KITCHEN",
        name: "Science Cafeteria Kitchen",
        email: "science@fuotuoke.edu.ng",
        password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq",
        role: "kitchen",
        status: "active",
        canteen: "Science Cafeteria",
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        userId: "SUB-KITCHEN",
        name: "Student Union Buka Kitchen",
        email: "sub@fuotuoke.edu.ng",
        password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq",
        role: "kitchen",
        status: "active",
        canteen: "Student Union Buka",
        createdAt: now,
        updatedAt: now
      },
      {
        id: 7,
        userId: "ENG-KITCHEN",
        name: "Engineering Canteen Kitchen",
        email: "eng@fuotuoke.edu.ng",
        password: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq",
        role: "kitchen",
        status: "active",
        canteen: "Engineering Canteen",
        createdAt: now,
        updatedAt: now
      },
      {
        id: 8,
        // Unique userId — was "zoehackz001" (duplicate). Password unchanged.
        userId: "FUO-STAFF-001",
        name: "Zoe Hackz Staff",
        email: "staff@fuotuoke.edu.ng",
        // bcrypt hash of "72364231Zoe@" (12 rounds) — DO NOT CHANGE
        password: "$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2",
        role: "staff",
        status: "active",
        canteen: null,
        createdAt: now,
        updatedAt: now
      }
    ],

    menu_items: [
      { id: 1,  name: "Eba + soup (Egusi/Vegetable)", price: 1500.00, cat: "Soup",   emoji: "", image: "/images/menu/eba_egusi_soup.png",     desc: "Fresh garri served with choice of Egusi or Vegetable soup",              popular: 1, available: 1, createdAt: now, updatedAt: now },
      { id: 2,  name: "Eba + Okra soup",              price: 1500.00, cat: "Soup",   emoji: "", image: "/images/menu/eba_okra_soup.png",       desc: "Yellow garri paired with draw okra soup and fish",                        popular: 0, available: 1, createdAt: now, updatedAt: now },
      { id: 3,  name: "Amala + Ewedu/Gbegiri",        price: 1700.00, cat: "Soup",   emoji: "", image: "/images/menu/amala_ewedu.png",          desc: "Soft yam flour with combination of Ewedu and bean soup",                  popular: 1, available: 1, createdAt: now, updatedAt: now },
      { id: 4,  name: "Pounded yam + soup",           price: 1700.00, cat: "Soup",   emoji: "", image: "/images/menu/pounded_yam_soup.png",     desc: "Smooth pounded yam served with choice of soup",                          popular: 1, available: 1, createdAt: now, updatedAt: now },
      { id: 5,  name: "Pepper soup (fish)",           price: 2500.00, cat: "Soup",   emoji: "", image: "/images/menu/pepper_soup_fish.png",     desc: "Spicy pepper soup broth served with fresh catfish",                      popular: 0, available: 1, createdAt: now, updatedAt: now },
      { id: 6,  name: "Jollof Rice & Chicken",        price: 2500.00, cat: "Rice",   emoji: "", image: "/images/menu/jollof_rice_chicken.png",  desc: "Rich smokey Nigerian party Jollof served with fried chicken",            popular: 1, available: 1, createdAt: now, updatedAt: now },
      { id: 7,  name: "Fried Rice & Fish",            price: 2500.00, cat: "Rice",   emoji: "", image: "/images/menu/fried_rice_chicken.png",   desc: "Savory seasoned fried rice mixed with vegetables and fried fish",        popular: 0, available: 1, createdAt: now, updatedAt: now },
      { id: 8,  name: "White Rice & Stew",            price: 1800.00, cat: "Rice",   emoji: "", image: "/images/menu/white_rice_stew.png",      desc: "Fluffy white long-grain rice served with standard tomato stew and beef", popular: 0, available: 1, createdAt: now, updatedAt: now },
      { id: 9,  name: "Spaghetti Bolognese",          price: 2000.00, cat: "Mains",  emoji: "", image: "/images/menu/spaghetti_chicken.png",    desc: "Pasta tossed in seasoned minced beef sauce",                             popular: 1, available: 1, createdAt: now, updatedAt: now },
      { id: 10, name: "Plantain & Egg Sauce",         price: 1500.00, cat: "Mains",  emoji: "", image: "/images/menu/fried_plantain.png",       desc: "Fried sweet plantain slices served with scrambled egg sauce",            popular: 0, available: 1, createdAt: now, updatedAt: now },
      { id: 11, name: "Meat Pie",        price: 800.00, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1588168333986-5078647ac9ab?auto=format&fit=crop&w=600&q=80", desc: "Baked pastry filled with minced beef and potatoes", popular: 1, available: 1, createdAt: now, updatedAt: now },
      { id: 12, name: "Sausage Roll",    price: 600.00, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80", desc: "Savory sausage meat rolled in flaky pastry",        popular: 0, available: 1, createdAt: now, updatedAt: now },
      { id: 13, name: "Chilled Coca-Cola", price: 500.00, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80", desc: "35cl pet bottle served ice-cold", popular: 0, available: 1, createdAt: now, updatedAt: now },
      { id: 14, name: "Cold Fanta",        price: 500.00, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1581009137042-c552e4856c7d?auto=format&fit=crop&w=600&q=80", desc: "35cl pet bottle served ice-cold", popular: 0, available: 1, createdAt: now, updatedAt: now },
      { id: 15, name: "Water (Bottle)",    price: 300.00, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1560023907-5f67b3104e94?auto=format&fit=crop&w=600&q=80", desc: "75cl pure table water bottle",    popular: 0, available: 1, createdAt: now, updatedAt: now }
    ],

    menu_extras: [
      { id: 1,  menuItemId: 1, name: "Extra Beef",       price: 500.00  },
      { id: 2,  menuItemId: 1, name: "Extra Eba",        price: 200.00  },
      { id: 3,  menuItemId: 2, name: "Extra Fish",       price: 500.00  },
      { id: 4,  menuItemId: 2, name: "Extra Eba",        price: 200.00  },
      { id: 5,  menuItemId: 3, name: "Extra Meat",       price: 500.00  },
      { id: 6,  menuItemId: 3, name: "Extra Amala",      price: 300.00  },
      { id: 7,  menuItemId: 4, name: "Extra Meat",       price: 500.00  },
      { id: 8,  menuItemId: 4, name: "Extra Yam",        price: 300.00  },
      { id: 9,  menuItemId: 6, name: "Extra Chicken",    price: 1000.00 },
      { id: 10, menuItemId: 6, name: "Plantain portion", price: 300.00  },
      { id: 11, menuItemId: 7, name: "Extra Fish",       price: 800.00  },
      { id: 12, menuItemId: 7, name: "Coleslaw side",    price: 200.00  }
    ],

    orders: [],
    order_items: [],
    order_item_extras: [],

    settings: [
      {
        id: 1,
        maintenanceMode: 0,
        allowRegistration: 1,
        allowDeliveries: 1,
        deliveryFee: 300.00,
        supportPhone: "08012345678",
        createdAt: now,
        updatedAt: now
      }
    ],

    audit_logs: [],
    refresh_tokens: []
  };
};
