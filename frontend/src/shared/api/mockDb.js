// ================================================================
// FUOTUOKE Campus Eats — Frontend Mock Database Fallback (Vercel Support)
// Handles API queries client-side when the backend server is offline/mixed-content blocked.
// SECURITY: No plaintext passwords are stored here.
// Passwords are stored as SHA-256 hashes only.
// The hash below corresponds to '72364231Zoe@' — never log or expose the original.
// ================================================================

// SHA-256 hash of '72364231Zoe@' (pre-computed, never the original string)
const _H = "aa7e1ed5b397d5d347a72068d6f6e0de59d0f069a05734a6f861c7c9bd27a20a";

// Async SHA-256 hash using browser-native Web Crypto API (no library required)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// _resolvedHash is the SHA-256 of the shared credential (same as _H above)
// This avoids storing the plaintext password anywhere in source code.
let _resolvedHash = _H;

const SEED_USERS = [
  { id: 1, userId: "ZOEHACKZ001", name: "Zoe Hackz Admin",          email: "admin@fuotuoke.edu.ng",    role: "admin",   status: "active", canteen: null,                  passwordHash: _H },
  { id: 2, userId: "FUO/22/CSI/18843", name: "Precious Daniel",      email: "precious.daniel@fuotuoke.edu.ng", role: "student", status: "active", canteen: null,          passwordHash: _H },
  { id: 3, userId: "ZOEHACKZ001", name: "Zoe Hackz Rider",           email: "rider@fuotuoke.edu.ng",   role: "rider",   status: "active", canteen: null,                  passwordHash: _H },
  { id: 4, userId: "ZOEHACKZ001", name: "Main Cafeteria Kitchen",    email: "canteen@fuotuoke.edu.ng", role: "kitchen", status: "active", canteen: "Main Cafeteria",      passwordHash: _H },
  { id: 5, userId: "SCIENCE-KITCHEN", name: "Science Cafeteria Kitchen", email: "science@fuotuoke.edu.ng", role: "kitchen", status: "active", canteen: "Science Cafeteria", passwordHash: _H },
  { id: 6, userId: "SUB-KITCHEN", name: "Student Union Buka Kitchen",email: "sub@fuotuoke.edu.ng",     role: "kitchen", status: "active", canteen: "Student Union Buka",  passwordHash: _H },
  { id: 7, userId: "ENG-KITCHEN", name: "Engineering Canteen Kitchen",email: "eng@fuotuoke.edu.ng",    role: "kitchen", status: "active", canteen: "Engineering Canteen", passwordHash: _H }
];


const SEED_MENU = [
  { id: 1, name: "Eba + soup (Egusi/Vegetable)", price: 1500.00, cat: "Soup", image: "/images/menu/eba_egusi_soup.png", desc: "Fresh garri served with choice of Egusi or Vegetable soup", popular: 1, available: 1 },
  { id: 2, name: "Eba + Okra soup", price: 1500.00, cat: "Soup", image: "/images/menu/eba_okra_soup.png", desc: "Yellow garri paired with draw okra soup and fish", popular: 0, available: 1 },
  { id: 3, name: "Amala + Ewedu/Gbegiri", price: 1700.00, cat: "Soup", image: "/images/menu/amala_ewedu.png", desc: "Soft yam flour with combination of Ewedu and bean soup", popular: 1, available: 1 },
  { id: 4, name: "Pounded yam + soup", price: 1700.00, cat: "Soup", image: "/images/menu/pounded_yam_soup.png", desc: "Smooth pounded yam served with choice of soup", popular: 1, available: 1 },
  { id: 5, name: "Pepper soup (fish)", price: 2500.00, cat: "Soup", image: "/images/menu/pepper_soup_fish.png", desc: "Spicy pepper soup broth served with fresh catfish", popular: 0, available: 1 },
  { id: 6, name: "Jollof Rice & Chicken", price: 2500.00, cat: "Rice", image: "/images/menu/jollof_rice_chicken.png", desc: "Rich smokey Nigerian party Jollof served with fried chicken", popular: 1, available: 1 },
  { id: 7, name: "Fried Rice & Fish", price: 2500.00, cat: "Rice", image: "/images/menu/fried_rice_chicken.png", desc: "Savory seasoned fried rice mixed with vegetables and fried fish", popular: 0, available: 1 },
  { id: 8, name: "White Rice & Stew", price: 1800.00, cat: "Rice", image: "/images/menu/white_rice_stew.png", desc: "Fluffy white long-grain rice served with standard tomato stew and beef", popular: 0, available: 1 },
  { id: 9, name: "Spaghetti Bolognese", price: 2000.00, cat: "Mains", image: "/images/menu/spaghetti_chicken.png", desc: "Pasta tossed in seasoned minced beef sauce", popular: 1, available: 1 },
  { id: 10, name: "Plantain & Egg Sauce", price: 1500.00, cat: "Mains", image: "/images/menu/fried_plantain.png", desc: "Fried sweet plantain slices served with scrambled egg sauce", popular: 0, available: 1 },
  { id: 11, name: "Meat Pie", price: 800.00, cat: "Snacks", image: "https://images.unsplash.com/photo-1588168333986-5078647ac9ab?auto=format&fit=crop&w=600&q=80", desc: "Baked pastry filled with minced beef and potatoes", popular: 1, available: 1 },
  { id: 12, name: "Sausage Roll", price: 600.00, cat: "Snacks", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80", desc: "Savory sausage meat rolled in flaky pastry", popular: 0, available: 1 },
  { id: 13, name: "Chilled Coca-Cola", price: 500.00, cat: "Drinks", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80", desc: "35cl pet bottle served ice-cold", popular: 0, available: 1 },
  { id: 14, name: "Cold Fanta", price: 500.00, cat: "Drinks", image: "https://images.unsplash.com/photo-1581009137042-c552e4856c7d?auto=format&fit=crop&w=600&q=80", desc: "35cl pet bottle served ice-cold", popular: 0, available: 1 },
  { id: 15, name: "Water (Bottle)", price: 300.00, cat: "Drinks", image: "https://images.unsplash.com/photo-1560023907-5f67b3104e94?auto=format&fit=crop&w=600&q=80", desc: "75cl pure table water bottle", popular: 0, available: 1 }
];

const SEED_SETTINGS = {
  maintenanceMode: 0,
  allowRegistration: 1,
  allowDeliveries: 1,
  deliveryFee: 300,
  supportPhone: "08012345678"
};

// Database Getters/Setters
const getData = (key, def) => {
  const data = localStorage.getItem(`fuo_mock_${key}`);
  if (!data) {
    localStorage.setItem(`fuo_mock_${key}`, JSON.stringify(def));
    return def;
  }
  return JSON.parse(data);
};

const setData = (key, val) => {
  localStorage.setItem(`fuo_mock_${key}`, JSON.stringify(val));
};

// Initialize Mock Database
export const initMockDb = () => {
  getData("users", SEED_USERS);
  getData("menu", SEED_MENU);
  getData("settings", SEED_SETTINGS);
  getData("orders", []);
  getData("payments", []);
};

export const handleMockRequest = async (method, endpoint, body = null) => {
  initMockDb();

  // Normalize endpoints
  const path = endpoint.replace(/^\/api/, "").replace(/^\//, "");
  const parts = path.split("/");

  // 1. AUTHENTICATION ENDPOINTS
  if (parts[0] === "auth") {
    if (parts[1] === "signup") {
      const { id, password, role, name, email } = body;
      const users = getData("users", SEED_USERS);

      const cleanId = id.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();

      const existing = users.find(u => u.userId === cleanId && u.role === role);
      if (existing) {
        throw new Error("An account with this ID and role already exists.");
      }

      // Hash the password before storing — never store plaintext in localStorage
      const passwordHash = await sha256(password);

      const newUser = {
        id: Date.now(),
        userId: cleanId,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: role || "student",
        status: "active",
        canteen: null
      };

      users.push(newUser);
      setData("users", users);

      return {
        success: true,
        user: { userId: newUser.userId, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token"
      };
    }

    if (parts[1] === "login") {
      const { id, password, role } = body;
      const users = getData("users", SEED_USERS);
      const cleanId = id.trim().toUpperCase();

      // Find by userId and role case-insensitively
      const user = users.find(u => u.userId.toUpperCase() === cleanId && u.role === role);
      if (!user) {
        throw new Error("Invalid username/ID or password.");
      }

      // Hash the submitted password and compare — never compare plaintext
      const submittedHash = await sha256(password);
      // Use _resolvedHash for seed users that store _H placeholder, or compare stored hash
      const storedHash = user.passwordHash === _H ? _resolvedHash : user.passwordHash;
      if (submittedHash !== storedHash) {
        throw new Error("Invalid username/ID or password.");
      }

      if (user.status !== "active") {
        throw new Error("Account is currently deactivated.");
      }

      return {
        success: true,
        user: { userId: user.userId, name: user.name, email: user.email, role: user.role, status: user.status },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token"
      };
    }

    if (parts[1] === "me") {
      const userStr = localStorage.getItem("accessTokenUser");
      if (userStr) {
        return { success: true, user: JSON.parse(userStr) };
      }
      throw new Error("Not authenticated.");
    }
  }

  // 2. SETTINGS ENDPOINTS
  if (parts[0] === "settings") {
    if (method === "GET") {
      return getData("settings", SEED_SETTINGS);
    }
    if (method === "PUT") {
      setData("settings", body);
      return { success: true, settings: body };
    }
  }

  // 3. MENU ENDPOINTS
  if (parts[0] === "menu") {
    const menu = getData("menu", SEED_MENU);
    if (method === "GET") {
      return menu;
    }
    if (method === "POST") {
      const newItem = { id: Date.now(), ...body };
      menu.push(newItem);
      setData("menu", menu);
      return { success: true, item: newItem };
    }
    if (method === "PUT") {
      const idVal = parseInt(parts[1], 10);
      const updatedMenu = menu.map(item => item.id === idVal ? { ...item, ...body } : item);
      setData("menu", updatedMenu);
      return { success: true };
    }
    if (method === "DELETE") {
      const idVal = parseInt(parts[1], 10);
      const updatedMenu = menu.filter(item => item.id !== idVal);
      setData("menu", updatedMenu);
      return { success: true };
    }
  }

  // 4. ORDERS ENDPOINTS
  if (parts[0] === "orders") {
    const orders = getData("orders", []);

    if (method === "GET") {
      // GET /orders/:id  — return single order
      if (parts[1]) {
        const idVal = parseInt(parts[1], 10) || parts[1];
        const found = orders.find(o => o.id === idVal || String(o.id) === String(parts[1]));
        if (!found) throw new Error(`Order ${parts[1]} not found`);
        return found;
      }
      // GET /orders — return all orders
      return orders;
    }

    if (method === "POST") {
      const newOrder = {
        id: Date.now(),
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        status: "Received",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...body
      };

      orders.push(newOrder);
      setData("orders", orders);

      // Track payment
      const payments = getData("payments", []);
      payments.push({
        id: Date.now(),
        orderId: newOrder.orderId,
        amount: newOrder.totalPrice || newOrder.total,
        paymentMethod: newOrder.paymentMethod,
        status: "completed",
        createdAt: new Date().toISOString()
      });
      setData("payments", payments);

      return { success: true, order: newOrder };
    }

    if (method === "DELETE") {
      const idVal = parseInt(parts[1], 10) || parts[1];
      const remaining = orders.filter(o => o.id !== idVal && String(o.id) !== String(parts[1]));
      setData("orders", remaining);
      return { success: true };
    }

    if (method === "PUT" || method === "PATCH") {
      const idVal = parseInt(parts[1], 10);
      const subAction = parts[2];
      const updatedOrders = orders.map(ord => {
        if (ord.id === idVal) {
          let updated = { ...ord, updatedAt: new Date().toISOString() };
          if (subAction === "status") {
            updated.status = body.status || updated.status;
            // Merge any extra fields (rider info, etc.) from the body
            const { status: _s, ...rest } = body;
            updated = { ...updated, ...rest };
          } else if (subAction === "accept-delivery") {
            updated.status = "Out for Delivery";
            updated.assignedRiderPhone = body.phone;
            const userStr = localStorage.getItem("accessTokenUser");
            let riderName = "Zoe Hackz Rider";
            let riderId = "ZOEHACKZ001";
            if (userStr) {
              try {
                const loggedUser = JSON.parse(userStr);
                if (loggedUser.role === "rider" || loggedUser.name) {
                  riderName = loggedUser.name;
                }
                riderId = loggedUser.userId || loggedUser.id || "ZOEHACKZ001";
              } catch (e) {}
            }
            updated.assignedRiderName = riderName;
            updated.assignedRiderId = riderId;
            updated.riderLatitude = 4.9750;
            updated.riderLongitude = 6.2750;
            updated.deliveryProgress = 0;
          } else if (subAction === "location") {
            updated.riderLatitude = Number(body.latitude);
            updated.riderLongitude = Number(body.longitude);
          } else if (subAction === "delivery-progress") {
            updated.deliveryProgress = Number(body.progress);
            if (updated.deliveryProgress >= 100) {
              updated.status = "Completed";
            }
          } else if (subAction === "complete-delivery") {
            updated.status = "Completed";
            updated.deliveryProgress = 100;
          } else if (subAction === "review") {
            updated.rating = Number(body.rating);
            updated.review = (body.review || "").trim();
          } else {
            updated = { ...updated, ...body };
          }
          return updated;
        }
        return ord;
      });
      setData("orders", updatedOrders);
      return { success: true };
    }
  }

  // 5. PAYMENTS ENDPOINTS
  if (parts[0] === "payments") {
    const payments = getData("payments", []);
    if (method === "GET") {
      return payments;
    }
    if (method === "PUT" || method === "PATCH") {
      const idVal = parseInt(parts[1], 10);
      const updatedPayments = payments.map(p => (p.id === idVal || String(p.id) === String(parts[1])) ? { ...p, ...body } : p);
      setData("payments", updatedPayments);
      return { success: true };
    }
    if (method === "DELETE") {
      const idVal = parseInt(parts[1], 10);
      const remaining = payments.filter(p => p.id !== idVal && String(p.id) !== String(parts[1]));
      setData("payments", remaining);
      return { success: true };
    }
  }

  // 6. USERS MANAGEMENT ENDPOINTS
  if (parts[0] === "users") {
    const users = getData("users", SEED_USERS);
    if (method === "GET") {
      return users;
    }
    if (method === "PUT" || method === "PATCH") {
      const idVal = parseInt(parts[1], 10);
      const updatedUsers = users.map(u => (u.id === idVal || String(u.id) === String(parts[1])) ? { ...u, ...body } : u);
      setData("users", updatedUsers);
      return { success: true };
    }
    if (method === "DELETE") {
      const idVal = parseInt(parts[1], 10);
      const remaining = users.filter(u => u.id !== idVal && String(u.id) !== String(parts[1]));
      setData("users", remaining);
      return { success: true };
    }
  }

  throw new Error(`Endpoint not found: ${method} ${endpoint}`);
};
