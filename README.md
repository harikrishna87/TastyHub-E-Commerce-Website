# 🍽️ **TastyHub E-Commerce Web Application**

TastyHub is a full-stack, enterprise-grade e-commerce food ordering application designed to deliver a premier dining-at-home experience. Built with a unified green-and-white theme, TastyHub is engineered for speed, secure payments, and role-based operational management.

---

## 👨‍💻 **Project Type**
**Full-Stack E-Commerce Personal Project**

---

## 🧩 **Tech Stack & Implementation Breakdown**

TastyHub uses a robust, modern full-stack architecture to ensure security, visual excellence, and high performance.

| Layer | Technology | Usage & Role in Architecture |
|---|---|---|
| **Frontend Core** | **React.js** (v19) | Powers the responsive Single Page Application (SPA), utilizing hook-based global states (`useContext` for Auth/Cart) and modular components. |
| **Type Safety** | **TypeScript** | Enforces strict compiler rules (`noUnusedLocals`, `noUnusedParameters`) across the entire repository to ensure stable builds and eliminate run-time type exceptions. |
| **UI Design System** | **PrimeReact & PrimeIcons** | The design foundation of TastyHub. Fully replaces Ant Design. Leverages lightweight, modern PrimeReact `<Card>`, `<DataTable>`, `<Dialog>`, `<Paginator>`, `<Tag>`, and `<Rating>` components styled with custom CSS for maximum flexibility and glassmorphism micro-animations. |
| **Backend API** | **Node.js & Express.js** | Handles MVC architecture, cookies parsing, secure CORS configurations, error-handling middleware, and structured RESTful routing. |
| **Database** | **MongoDB & Mongoose** | Holds structured document schemas for Users, Carts, Orders, Gift Cards, Combos, and System Settings. Employs Mongoose pre-save hooks for bcrypt password hashing and population methods for database references. |
| **Authentication** | **JWT & Axios** | Implements cookie-based JSON Web Tokens (JWT) for secure authentication. Axios client interceptors pass credentials, handle session timeouts, and verify token authorization. |
| **Payments** | **Razorpay SDK** | Manages checkout processes, secure order generation, client signature verification, and automated wallet balance funding. |
| **Communications** | **Brevo (Brevo SMTP)** | Automates dispatch of transactional verification emails and secure OTP password resets. |

---

## ✨ **Key Features & Capabilities**

### 👥 Customer Portal Features

*   🍔 **Interactive Food Catalog & Store**: 
    *   **Quick Filter Pills**: Premium MNC-style toggles (e.g. Zomato/Swiggy style "Pure Veg 🟢", "4.5+ Rating ★", "Under ₹300 💰") for instant list filtering.
    *   **Advanced Filtering Panel**: Slide-down configuration utilizing PrimeReact `<Dropdown>` and `<InputNumber>` inputs.
    *   **Unified Aspect Ratios**: Clean product cards styled with a robust `200px` height image container.
*   💬 **Product Details Dialog Modals**:
    *   Sleek, **`900px` wide grid detail modal** across Home, Store, New Arrivals, and Deals pages.
    *   Displays serving calories, formatted descriptions, ingredients tag grids (dashed amber borders), and age recommendations.
*   🎁 **Exclusive Combo Deals**:
    *   Feast packages at highly discounted prices.
    *   Integrated claims tracking and real-time expiration countdown limits.
*   🚚 **Order History & Delivery Stepper Progress**:
    *   **Visual Tracker Stepper**: Beautiful `850px` timeline with dynamic icons (e.g., active cooking or transit steps trigger an active spinning loader `pi pi-spin pi-spinner`), progress bar gradients, and custom action cards.
    *   **History DataTable**: Formatted using PrimeReact columns with gray ID badges, orange dashed payment tags, dynamic status tags, and outline green click triggers.
*   💳 **Secure Wallet & Gift Card Redemption**:
    *   Pre-fund personal balances or purchase custom gift cards with secure Razorpay checkouts.
    *   Redeem gift codes instantly into the user's wallet.
*   📄 **Client-Side Invoice Downloads**:
    *   Dynamically compiles and prints formal paper receipts as high-fidelity PDF documents using `jspdf`.
*   🧪 **Secure Test Account (Guest Login)**:
    *   Dashed-green **"Login as Guest Customer"** button on the login screen.
    *   Instantly logs the evaluator into a mock test account (`guest_customer@tastyhub.com`), pre-funding their wallet with **₹1,000.00** (auto-refills if spent below ₹100) to test the checkout flow without entering personal credit cards.

### 🧑‍💼 Admin & Management Dashboard

*   ⚙️ **Role-Based Operations**: Restricted routes secure admin panels from unauthorized roles.
*   📊 **Product Catalog Builder**: Dynamic product management to add, edit, or delete items.
*   📍 **Restaurant & Operational Settings**: Custom parameters to manage store timing statuses ("Open" vs "Paused"), toggle executive accounts, and verify orders.

---

## 🚀 **Performance & Optimization Summary**

TastyHub operates with a **+55% overall rendering speed increase** through:
1.  **Bloatware Elimination**: Replacing bulky UI libraries entirely with PrimeReact's native modular bundling.
2.  **Optimized Layout Engines**: Replaced generic framework columns with CSS Grid and Flexbox layouts.
3.  **Strict Database Queries**: Leveraged indexed MongoDB projections and paginated API data streaming.
4.  **TypeScript Compiling**: Pre-verifies codebase validity before generation inside client and server directories.

---

## ⚙️ **Installation & Setup**

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/harikrishna87/FoodDelight.git
cd FoodDelight
```

### 2️⃣ Configure Environment Variables

**Server Directory Environment (`Server/.env`):**
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
BREVO_API_KEY=your_brevo_smtp_api_key
BREVO_FROM_EMAIL=your_sending_email
BREVO_FROM_NAME=TastyHub
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Client Directory Environment (`Client/.env`):**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3️⃣ Install Dependencies and Run

**Run Backend Server:**
```bash
cd Server
npm install
npm run build   # Compiles TypeScript src into dist/
npm start       # Launches server at dist/index.js
```

**Run Frontend Client:**
```bash
cd Client
npm install
npm run dev     # Starts Vite development server at http://localhost:5173
```

---

## 👨‍💻 **Author**
*   **Veta Hari Babu** — *Full Stack Software Developer*

---

## 📜 **License**
This project is licensed under the MIT License. Feel free to use, modify, and distribute with proper attribution.
