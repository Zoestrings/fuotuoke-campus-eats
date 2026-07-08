# FUOTUOKE Campus Eats

FUOTUOKE Campus Eats is a modern, responsive online food ordering and delivery system designed for the Federal University Otuoke (FUOTUOKE) campus community. It enables students, staff, canteen kitchens, and delivery riders to interact seamlessly under a single, unified platform.

---

## 🚀 Key Features

* **Multi-Actor Dashboard Views**: Fully isolated role-based access for Students, Staff, Kitchen staff, Riders, and System Administrators.
* **Declarative Routing**: Secured with React Router v6 guarded route paths.
* **Hybrid Database Layer**: Connects to a production-ready **MySQL** database with a transparent, self-healing **JSON-file SQL emulator** fallback for easy local zero-setup development.
* **E-Commerce Checkout & Paystack Support**: Secure payment processing with sandbox simulation support.
* **Live Rider Tracking**: Interactive progress updates for deliveries.
* **Fully Responsive UI**: Mobile, tablet, laptop, and desktop friendly layout.

---

## 📁 Project Structure

```text
├── docs/                        # Project specifications & Word docs
├── public/                      # Static assets (logos, images, menu items)
├── server/                      # Express.js Backend API
│   ├── config/                  # DB configuration (db.js, schema.sql, database.json fallback)
│   ├── middleware/              # Authentication & global error handling
│   ├── models/                  # SQL models (User, MenuItem, Order, Settings, AuditLog)
│   ├── routes/                  # API route definitions
│   ├── server.js                # Server entry point
│   └── seed.js                  # Database seeder script
└── src/                         # React Frontend Application
    ├── admin/                   # Admin console views & controller
    ├── customer/                # Customer (Student/Staff) ordering views
    ├── rider/                   # Delivery rider view & controller
    ├── vendor/                  # Cafeteria/Kitchen dashboard views
    ├── shared/                  # UI components, Axios API client, styles
    ├── context/                 # JWT Authentication Context
    ├── App.js                   # Main application router
    └── index.js                 # Frontend entry point
```

---

## 🛠️ Local Setup Instructions

### Prerequisites
* **Node.js** (v16.x or higher)
* **npm** (v8.x or higher)
* **MySQL Database** (Optional, falls back automatically to self-contained JSON storage)

---

### 1. Server Configuration & Setup

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `server/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # MySQL connection configuration (Only if MySQL is running)
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=fuotuoke_campus_eats

   # JWT secrets
   JWT_SECRET=fuo_jwt_secret_key_2024_campus_eats
   JWT_REFRESH_SECRET=fuo_jwt_refresh_secret_key_2024
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_EXPIRES_IN=7d

   # Paystack API Keys (leave mock values for Sandbox mode)
   PAYSTACK_SECRET_KEY=sk_test_xxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxx
   ```
4. Run the database seeder to initialize the tables and seed default actor accounts:
   ```bash
   npm run seed
   ```
   *Note: If no local MySQL server is found on port 3306, the seeder automatically initializes the persistent `server/config/database.json` file database.*
5. Start the backend API server:
   ```bash
   npm start
   ```
   The backend API will run at `http://localhost:5000/`.

---

### 2. Frontend Configuration & Setup

1. Open a new terminal and navigate to the project root directory:
   ```bash
   cd ..
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
   The application will launch automatically in your browser at `http://localhost:3000/`.

---

## 🔐 Default Seed Credentials

Use the following credentials to log in to the different dashboards in Sandbox mode:

| Role | Username / ID | Password | Portal / Path |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `zoehackz001` | `72364231Zoe@` | Staff Portal (`/staff_login`) |
| **Cafeteria Kitchen Staff** | `zoehackz001` | `72364231Zoe@` | Staff Portal (`/staff_login`) |
| **Delivery Rider** | `zoehackz001` | `72364231Zoe@` | Staff Portal (`/staff_login`) |
| **Student Customer** | `FUO/22/CSI/18843` | `72364231Zoe@` | Main Portal (`/login`) |

---

## 🚀 Deployment Instructions

### Frontend (e.g., Vercel / Netlify)
Set the following environment variables in your deployment dashboard:
* `REACT_APP_API_URL` = Your deployed backend API URL (e.g. `https://api.yourdomain.com`)

### Backend (e.g., Render / Heroku)
Ensure you set the server environment variables in your platform dashboard, including your hosted MySQL database connection credentials.
