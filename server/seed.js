// ================================================================
// FUOTUOKE Campus Eats — Database Seeder (API-backed, Emoji-free)
// Run: cd server && node seed.js
// ================================================================

require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const User = require("./models/User");
const MenuItem = require("./models/MenuItem");
const Settings = require("./models/Settings");
const AuditLog = require("./models/AuditLog");

// ── Menu Data (same as frontend data.js, without emojis) ──
const MENU = [
  { name: "Eba + soup (Egusi/Vegetable)", price: 800, cat: "Soup", emoji: "", image: "/images/menu/eba_egusi_soup.png", desc: "Fresh garri served with choice of Egusi or Vegetable soup", popular: true, extras: [{ name: "Extra Beef", price: 400 }, { name: "Extra Eba", price: 200 }] },
  { name: "Eba + Okra soup", price: 800, cat: "Soup", emoji: "", image: "/images/menu/eba_okra_soup.png", desc: "Yellow garri paired with draw okra soup and fish", popular: false, extras: [{ name: "Extra Fish", price: 500 }, { name: "Extra Eba", price: 200 }] },
  { name: "Amala + Ewedu/Gbegiri", price: 800, cat: "Soup", emoji: "", image: "/images/menu/amala_ewedu.png", desc: "Soft yam flour with combination of Ewedu and bean soup", popular: true, extras: [{ name: "Extra Meat", price: 400 }, { name: "Extra Amala", price: 200 }] },
  { name: "Pounded yam + soup", price: 1000, cat: "Soup", emoji: "", image: "/images/menu/pounded_yam_soup.png", desc: "Smooth pounded yam served with choice of soup", popular: true, extras: [{ name: "Extra Meat", price: 500 }, { name: "Extra Yam", price: 300 }] },
  { name: "Pepper soup (fish)", price: 1000, cat: "Soup", emoji: "", image: "/images/menu/pepper_soup_fish.png", desc: "Spicy campus fresh catfish pepper soup", popular: true, extras: [{ name: "Extra Fish", price: 500 }] },
  { name: "Pepper soup (goat meat)", price: 1250, cat: "Soup", emoji: "", image: "/images/menu/pepper_soup_goat.png", desc: "Hot and spicy local goat meat pepper soup", popular: true, extras: [{ name: "Extra Goat Meat", price: 600 }] },
  { name: "Jollof rice + chicken/beef", price: 900, cat: "Rice", emoji: "", image: "/images/menu/jollof_rice_chicken.png", desc: "Smoky campus jollof rice served with chicken or beef", popular: true, extras: [{ name: "Extra Chicken", price: 500 }, { name: "Fried Plantain", price: 200 }, { name: "Boiled Egg", price: 150 }] },
  { name: "Jollof rice + plantain (no meat)", price: 600, cat: "Rice", emoji: "", image: "/images/menu/jollof_rice_plantain.png", desc: "Nigerian party jollof rice paired with fried plantain", popular: false, extras: [{ name: "Boiled Egg", price: 150 }] },
  { name: "White rice + stew + meat", price: 900, cat: "Rice", emoji: "", image: "/images/menu/white_rice_stew.png", desc: "Steamed white rice served with local tomato stew and meat", popular: false, extras: [{ name: "Extra Meat", price: 400 }, { name: "Fried Plantain", price: 200 }] },
  { name: "Fried rice + chicken", price: 1000, cat: "Rice", emoji: "", image: "/images/menu/fried_rice_chicken.png", desc: "Tasty wok-fried rice served with grilled chicken", popular: true, extras: [{ name: "Extra Chicken", price: 500 }, { name: "Coleslaw", price: 150 }] },
  { name: "Rice + beans (combo)", price: 800, cat: "Rice", emoji: "", image: "/images/menu/rice_beans_combo.png", desc: "Combo of white rice and brown beans porridge with stew", popular: false, extras: [{ name: "Extra Meat", price: 400 }, { name: "Fried Plantain", price: 200 }] },
  { name: "Beans (porridge)", price: 600, cat: "Mains", emoji: "", image: "/images/menu/beans_porridge.png", desc: "Slow-cooked honey beans porridge", popular: false, extras: [{ name: "Fried Fish", price: 500 }, { name: "Boiled Egg", price: 150 }] },
  { name: "Beans + plantain", price: 700, cat: "Mains", emoji: "", image: "/images/menu/beans_plantain.png", desc: "Slow-cooked honey beans porridge served with sweet plantains", popular: true, extras: [{ name: "Fried Fish", price: 500 }, { name: "Fried Egg", price: 150 }] },
  { name: "Fried plantain (dodo) — side", price: 250, cat: "Snacks", emoji: "", image: "/images/menu/fried_plantain.png", desc: "Portion of sweet, golden fried plantain slices", popular: false, extras: [] },
  { name: "Spaghetti (jollof/stir-fry) + egg", price: 700, cat: "Snacks", emoji: "", image: "/images/menu/spaghetti_egg.png", desc: "Stir-fried jollof spaghetti topped with boiled or fried egg", popular: true, extras: [{ name: "Sausage", price: 200 }] },
  { name: "Spaghetti + chicken", price: 1000, cat: "Snacks", emoji: "", image: "/images/menu/spaghetti_chicken.png", desc: "Stir-fried jollof spaghetti served with seasoned chicken", popular: true, extras: [{ name: "Fried Plantain", price: 200 }] },
  { name: "Indomie (plain)", price: 450, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80", desc: "Quick hot instant noodles prepared with local spices", popular: false, extras: [{ name: "Fried Egg", price: 150 }, { name: "Sausage", price: 200 }] },
  { name: "Indomie + Egg", price: 600, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", desc: "Hot instant noodles topped with fried or boiled egg", popular: true, extras: [{ name: "Sausage", price: 200 }, { name: "Extra Egg", price: 150 }] },
  { name: "Puff Puff", price: 200, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80", desc: "Sweet golden deep-fried dough balls — a campus favourite", popular: true, extras: [] },
  { name: "Meat Pie", price: 350, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1588168333986-5078647ac9ab?auto=format&fit=crop&w=600&q=80", desc: "Flaky pastry filled with seasoned minced meat and vegetables", popular: true, extras: [] },
  { name: "Chicken Pie", price: 400, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80", desc: "Crispy golden pastry stuffed with spiced shredded chicken", popular: false, extras: [] },
  { name: "Egg Roll", price: 300, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80", desc: "Boiled egg wrapped in soft dough and deep-fried to perfection", popular: true, extras: [] },
  { name: "Samosa (×3)", price: 300, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80", desc: "Crispy triangular pastry filled with spiced minced meat", popular: false, extras: [{ name: "Extra 3 pieces", price: 300 }] },
  { name: "Shawarma", price: 1500, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1561651823-34fed022540e?auto=format&fit=crop&w=600&q=80", desc: "Grilled chicken wrap with veggies, coleslaw, and creamy sauce", popular: true, extras: [{ name: "Extra Chicken", price: 500 }, { name: "Cheese", price: 200 }] },
  { name: "Popcorn (large)", price: 300, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80", desc: "Large bucket of freshly popped buttery popcorn", popular: false, extras: [{ name: "Caramel Drizzle", price: 100 }] },
  { name: "Chin Chin", price: 200, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80", desc: "Crunchy sweet fried dough strips — a classic Nigerian treat", popular: false, extras: [] },
  { name: "Akara + Pap", price: 400, cat: "Snacks", emoji: "", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80", desc: "Crispy bean cakes paired with smooth warm pap (ogi)", popular: true, extras: [{ name: "Extra Akara (3pcs)", price: 200 }] },
  { name: "Zobo Drink", price: 200, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80", desc: "Chilled hibiscus flower drink with ginger and pineapple", popular: true, extras: [{ name: "Large Cup", price: 100 }] },
  { name: "Kunu (Millet Drink)", price: 200, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80", desc: "Refreshing traditional millet-based drink served cold", popular: true, extras: [{ name: "Large Cup", price: 100 }] },
  { name: "Chapman", price: 500, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80", desc: "Nigeria's signature cocktail — Fanta, Sprite, grenadine, cucumber & lemon", popular: true, extras: [{ name: "Extra Large", price: 200 }] },
  { name: "Chilled Water (75cl)", price: 100, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1560023907-5f67b3104e94?auto=format&fit=crop&w=600&q=80", desc: "Ice-cold bottled water to stay hydrated on campus", popular: false, extras: [] },
  { name: "Coca-Cola (50cl)", price: 250, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80", desc: "Classic chilled Coca-Cola soft drink", popular: true, extras: [] },
  { name: "Fanta Orange (50cl)", price: 250, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1581009137042-c552e4856c7d?auto=format&fit=crop&w=600&q=80", desc: "Bright and bubbly Fanta orange soft drink", popular: false, extras: [] },
  { name: "Sprite (50cl)", price: 250, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1625772291427-f14e5b665390?auto=format&fit=crop&w=600&q=80", desc: "Crisp lemon-lime flavoured Sprite soft drink", popular: false, extras: [] },
  { name: "Malt Drink (Maltina/Amstel)", price: 350, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80", desc: "Rich, sweet malt beverage — non-alcoholic energy boost", popular: true, extras: [] },
  { name: "Hollandia Yoghurt", price: 300, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80", desc: "Creamy Hollandia yoghurt drink — strawberry or plain", popular: false, extras: [] },
  { name: "Fresh Fruit Juice", price: 400, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80", desc: "Freshly squeezed orange, pineapple, or watermelon juice", popular: true, extras: [{ name: "Large Cup", price: 150 }] },
  { name: "Smoothie (Mixed Fruit)", price: 600, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80", desc: "Thick blended smoothie with banana, mango, and yoghurt", popular: true, extras: [{ name: "Protein Boost", price: 200 }] },
  { name: "Iced Tea (Lemon/Peach)", price: 350, cat: "Drinks", emoji: "", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80", desc: "Refreshing iced tea with a choice of lemon or peach flavour", popular: false, extras: [] }
];

// ── Default Users ──
const USERS = [
  {
    userId: "FUO/22/CSI/18842",
    name: "Emeka Okafor",
    email: "emeka.okafor@fuotuoke.edu.ng",
    password: "Password123!",
    role: "student",
    status: "active"
  },
  {
    userId: "FUO/22/CSI/18843",
    name: "Precious Daniel",
    email: "precious.daniel@fuotuoke.edu.ng",
    password: "Password123!",
    role: "student",
    status: "active"
  },
  {
    userId: "FUO-STAFF-0042",
    name: "Ahmed Bello",
    email: "ahmed.bello@fuotuoke.edu.ng",
    password: "Password123!",
    role: "staff",
    status: "active"
  },
  {
    userId: "Zoehackz001",
    name: "Main Cafeteria Kitchen",
    email: "main.kitchen@fuotuoke.edu.ng",
    password: "72364231",
    role: "kitchen",
    status: "active",
    canteen: "Main Cafeteria"
  },
  {
    userId: "Zoehackz001",
    name: "System Administrator",
    email: "admin@fuotuoke.edu.ng",
    password: "72364231",
    role: "admin",
    status: "active"
  },
  {
    userId: "zoehackz001",
    name: "Zoe Hackz Rider",
    email: "rider@fuotuoke.edu.ng",
    password: "72364231",
    role: "rider",
    status: "active"
  }
];

// ── Seed Function ──
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Settings.deleteMany({});
    await AuditLog.deleteMany({});
    console.log("🗑  Cleared existing data");

    // Seed users (passwords will be auto-hashed by the pre-save hook)
    const users = await User.create(USERS);
    console.log(`👥 Seeded ${users.length} users`);

    // Seed menu items
    const items = await MenuItem.insertMany(MENU);
    console.log(`🍛 Seeded ${items.length} menu items`);

    // Seed default settings
    await Settings.create({});
    console.log("⚙️  Seeded default settings");

    // Seed initial audit log
    await AuditLog.create({
      user: "System",
      action: "Database seeded successfully",
      ip: "127.0.0.1"
    });
    console.log("📜 Seeded initial audit log");

    console.log("\n✅ Database seeding complete!\n");
    console.log("── Default Login Credentials ──");
    console.log("Student:  FUO/22/CSI/18843 / Password123!");
    console.log("Staff:    FUO-STAFF-0042   / Password123!");
    console.log("Kitchen:  Zoehackz001      / 72364231");
    console.log("Rider:    zoehackz001      / 72364231");
    console.log("Admin:    Zoehackz001      / 72364231\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

seed();
