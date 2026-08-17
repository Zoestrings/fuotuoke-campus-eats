# 🎓 FUOTUOKE Campus Eats — Campus Food Ordering & Delivery Platform

**FUOTUOKE Campus Eats** is a modern, full-stack, responsive web application and digital dining ecosystem designed specifically for the **Federal University Otuoke (FUOTUOKE)** campus community in Bayelsa State, Nigeria. 

The platform bridges the gap between campus food canteens, students, faculty staff, delivery riders, and university administration by offering real-time ordering, menu browsing, order tracking, multi-payment support, and automated workflow dispatch.

---

## 🌟 Key Highlights & System Features

### 👥 Multi-Role User Portals
* **Student & Staff Customers**: Seamlessly browse canteen menus by outlet or food category (Rice, Soup, Mains, Snacks, Drinks), customize meal options, search dishes, track active orders live, view order history, and save favorite dishes.
* **Cafeteria / Kitchen Vendors**: Real-time kitchen dashboard to manage incoming orders, mark preparation progress (*Pending → Confirmed → Preparing → Ready / Out for Delivery → Completed*), and filter orders by cafeteria outlet.
* **Delivery Riders**: Dedicated dispatch view to accept deliveries, view faculty drop-off locations, and update order delivery statuses.
* **System Administration**: High-level administrative console for managing system settings (delivery fee, maintenance mode, user registrations, support contact), user accounts, sales analytics, and security audit logs.

### 💳 Payment Gateways & Options
Supports 3 flexible and secure checkout methods:
1. **Credit / Debit Card**: Instant online card transaction checkout simulation.
2. **Direct Bank Transfer**: Direct transfer option with automated order confirmation to official university cafeteria bank accounts (First Bank Nigeria).
3. **Cash on Delivery / Pickup**: Pay cash upon delivery at faculty buildings or counter pickup.

### 🚀 Performance & UI Excellence
* **Single Primary Image Showcase**: Optimized food card layout with crisp imagery, rating badges, prep times, category emojis, and price highlights.
* **Mobile-First & PC Responsive Design**: Custom glassmorphism UI with hardware acceleration (`will-change: transform`, `transform: translate3d`), mobile bottom navigation tab bar, desktop top bar, touch manipulation optimization (`touch-action: manipulation`), and zero tap delay on mobile devices.
* **Instant Hot-Reloading**: Single-command execution launching backend API and frontend dev server concurrently with color-coded console logs.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend Framework** | React.js (v18+), React Router v6 |
| **Styling & UI System** | Custom Vanilla CSS (Design Tokens, Glassmorphic Panels, CSS Variables, Hardware Acceleration) |
| **Icons & Typography** | Bootstrap Icons, Google Fonts (*DM Sans*, *Plus Jakarta Sans*) |
| **Backend API** | Node.js, Express.js REST API |
| **Security & Auth** | JWT (JSON Web Tokens), Bcryptjs password hashing, Helmet headers, CORS, Express Rate Limit |
| **Database & Storage** | **MySQL** with automatic self-healing **JSON-file SQL fallback database** (`backend/config/database.json`) |
| **Dev Tools** | Nodemon, Concurrently, Vercel Deployment Suite |

---

## 📁 Repository Directory Architecture

```text
fuotuoke-campus-eats/
├── .vscode/                      # Editor settings (CSS linting, formatting rules)
├── backend/                      # Node.js + Express.js API Server
├── frontend/                     # React.js Client Application
│   ├── public/                   # Static public assets (Logos, favicons)
│   └── src/
│       ├── admin/                # System Administrator dashboard & controllers
│       ├── components/           # Reusable UI components & modals
│       ├── context/              # Toast notifications & Auth context
│       ├── customer/             # Customer (Student/Staff) ordering views
│       │   ├── views/
│       │   │   ├── Authentication/  # Login & Signup screens
│       │   │   ├── Cart/            # Shopping cart & checkout view
│       │   │   ├── Dashboard/       # Main customer dashboard & payment modal
│       │   │   ├── Menu/            # MenuBrowse (Food Cards) & MealDetail modals
│       │   │   ├── Notifications/   # Customer notifications list
│       │   │   ├── Orders/          # OrdersList & Live TrackOrder views
│       │   │   └── Profile/         # User profile settings
│       ├── rider/                # Delivery Rider portal & controls
│       ├── vendor/               # Kitchen Canteen Vendor management views
│       ├── shared/               # Shared API utilities & sound effects
│       ├── index.css             # Main Design System & Responsive CSS Styles
│       ├── App.js                # Root Application Routing & State Engine
│       └── data.js               # Campus Outlets, Food Items, & Sample Data
├── vercel.json                   # Vercel Production Build & Rewrite Config
└── package.json                  # Root Monorepo Scripts Wrapper
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
* **Node.js**: v16.x or higher
* **npm**: v8.x or higher
* **MySQL Database**: Optional *(If MySQL is not running on port 3306, the server seamlessly uses its built-in persistent JSON database emulator)*.

---

### 2. Single-Command Launch (Backend + Frontend)

Run both the **Express Backend Server** and **React Frontend Client** simultaneously in one terminal window with color-coded logs:

```bash
# Install all dependencies at root, backend, and frontend
npm install

# Start both Backend API and React App concurrently
npm run dev:all
```

* **Frontend Web App**: `http://localhost:3000`
* **Backend API Server**: `http://localhost:5000`

---

### 3. Individual Script Commands

If you prefer running backend and frontend in separate terminals:

```bash
# Run Frontend Only
npm run frontend

# Run Backend API Only (with Nodemon auto-restart)
npm run backend:dev

# Seed / Reset Database Records
npm run seed --prefix backend

# Production Build Test
npm run build
```

---

## 🔐 Default Demo Credentials

Use the following credentials to access the different actor roles during testing:

| Role | Username / ID | Password | Portal Login Path |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `zoehackz001` | `72364231Zoe@` | Staff Portal (`/staff_login`) |
| **Cafeteria Kitchen Vendor** | `zoehackz001` | `72364231Zoe@` | Staff Portal (`/staff_login`) |
| **Delivery Rider** | `zoehackz001` | `72364231Zoe@` | Staff Portal (`/staff_login`) |
| **Student / Staff Customer** | `FUO/22/CSI/18843` | `72364231Zoe@` | Main Customer Login (`/login`) |

---

## 🏬 Campus Cafeteria Outlets

The platform aggregates meals from all primary food outlets across the FUOTUOKE campuses:
1. **FUOTUOKE Main Cafeteria** — Central Campus Student Bukka
2. **East Campus Canteen** — Faculty of Engineering & Science Complex
3. **Science Complex Bukka** — Quick Bites & Cold Drinks
4. **Post-Graduate Diner** — Executive Staff & PG Student Lounge

---

## 🌐 Production Deployment (Vercel)

The repository is pre-configured with a `vercel.json` deployment manifest.

### Deployment Steps:
1. Push your repository code to GitHub (`origin/main`).
2. Connect your repository to **Vercel**.
3. Set the build parameters:
   * **Build Command**: `npm run build`
   * **Output Directory**: `frontend/build`
4. Deploy! Vercel automatically routes static assets and SPA rewrites seamlessly.

---

## 📝 License & Attribution

Designed & Developed for **Federal University Otuoke (FUOTUOKE)** Campus Community.  
*Knowledge · Excellence · Service*
