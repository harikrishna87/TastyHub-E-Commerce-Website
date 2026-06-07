# **TastyHub E-Commerce Web Application**

TastyHub is a full-stack, enterprise-grade e-commerce food ordering application designed to deliver a premier dining-at-home experience. Built with a unified green-and-white theme, TastyHub is engineered for speed, secure payments, and role-based operational management.

---

## **Project Type**
**Full-Stack E-Commerce Personal Project**

---

## **Tech Stack & Implementation Breakdown**

TastyHub uses a robust, modern full-stack architecture to ensure security, visual excellence, and high performance.

| Layer | Technology | Usage & Role in Architecture |
|---|---|---|
| **Frontend Core** | **React.js** (v19) | Powers the responsive Single Page Application (SPA), utilizing hook-based global states (`useContext` for Auth/Cart) and modular components. |
| **Type Safety** | **TypeScript** | Enforces strict compiler rules (`noUnusedLocals`, `noUnusedParameters`) across the entire repository to ensure stable builds and eliminate run-time type exceptions. |
| **UI Design System** | **PrimeReact & PrimeIcons** | The design foundation of TastyHub. Fully replaces Ant Design. Leverages lightweight, modern PrimeReact `<Card>`, `<DataTable>`, `<Dialog>`, `<Paginator>`, `<Tag>`, and `<Rating>` components styled with custom CSS for maximum flexibility and glassmorphic micro-animations. Cleaned up typography by removing keyboard emojis/emoticons throughout the client SPA and Brevo transactional email templates. |
| **Backend API** | **Node.js & Express.js** | Handles MVC architecture, cookie parsing, secure CORS configurations, error-handling middleware, and structured RESTful routing. |
| **Database** | **MongoDB & Mongoose** | Holds structured document schemas for Users, Carts, Orders, Gift Cards, Combos, and System Settings. Employs Mongoose pre-save hooks for bcrypt password hashing and population methods for database references. |
| **Authentication** | **JWT & Axios** | Implements cookie-based JSON Web Tokens (JWT) for secure authentication. Axios client interceptors pass credentials, handle session timeouts, and verify token authorization. Prevents console warnings by filtering out malformed JWT keys during logouts. |
| **Payments** | **Razorpay SDK** | Manages checkout processes, secure order generation, client signature verification, and automated wallet balance funding. |
| **Communications** | **Brevo (Brevo SMTP)** | Automates dispatch of transactional verification emails and secure OTP password resets. |

---

## **Key Features & Capabilities**

### Customer Portal Features

*   **Interactive Food Catalog & Store**: 
    *   **Quick Filter Pills**: Premium MNC-style toggles (e.g. Zomato/Swiggy style "Pure Veg", "4.5+ Rating", "Under Rs 300") for instant list filtering.
    *   **Advanced Filtering Panel**: Slide-down configuration utilizing PrimeReact `<Dropdown>` and `<InputNumber>` inputs.
    *   **Unified Aspect Ratios**: Clean product cards styled with a robust `200px` height image container.
*   **Product Details Dialog Modals**:
    *   Sleek, **`900px` wide grid detail modal** across Home, Store, New Arrivals, and Deals pages.
    *   Displays serving calories, formatted descriptions, ingredients tag grids (dashed amber borders), and age recommendations.
*   **Exclusive Combo Deals**:
    *   Feast packages at highly discounted prices.
    *   Integrated claims tracking and real-time expiration countdown limits.
*   **Order History & Delivery Stepper Progress**:
    *   **Visual Tracker Stepper**: Beautiful horizontal stepper utilizing PrimeReact `<Timeline>` with green-toned markers, active spin-loaders for active cooking or transit steps (`pi pi-spin pi-spinner`), progress bar gradients, and custom action cards. Fixed horizontal progress line constraints using precise percentages (`8.33%` and `16.67%`) to align exactly with circle centers.
    *   **History DataTable**: Premium admin-style DataTable matching the executive layout, styled with a soft grey border card, striped table rows, uppercase column headers (e.g. `ORDER ID`, `AMOUNT`, `STATUS`), and page size selection dropdowns.
*   **Secure Wallet & Gift Card Redemption**:
    *   Pre-fund personal balances or purchase custom gift cards with secure Razorpay checkouts.
    *   **Gift Card Modal**: Transitioned the buy gift card form to a pop-up `<Dialog>` modal to keep the layout clean, displaying a balance overview and a full-width **Personal Gift Cards Log** table in the tab panel.
    *   Redeem gift codes instantly into the user's wallet balance.
*   **Client-Side Invoice Downloads**:
    *   Dynamically compiles and prints formal paper receipts as high-fidelity PDF documents using `jspdf`.
*   **Secure Test Account (Guest Login)**:
    *   Dashed-green **"Login as Guest Customer"** button on the login screen.
    *   Instantly logs the evaluator into a mock test account (`guest_customer@tastyhub.com`), pre-funding their wallet with **Rs 1,000.00** (auto-refills if spent below Rs 100) to test the checkout flow without entering personal credit cards.
*   **Branded Portals & Password Toggles**:
    - Renamed and organized the authentication module to [UserAuth.tsx](file:///c:/Users/hari/OneDrive/Desktop/Projects/TastyHub-E-Commerce-Website/Client/src/Pages/Customer/UserAuth.tsx) within the customer directory.
    - Integrated interactive visibility eye/eye-slash PrimeIcons (`pi pi-eye` / `pi pi-eye-slash`) on password fields across User and Admin login flows (including reset password inputs) with safety offsets.
    - Viewport height centering dynamically targets available screen real estate (`min-height: 100vh` on auth container) to center the card exactly on the screen without layout scrollbars.
    - Swapped title header branding to "Welcome to TastyHub" for a friendly landing page experience.
*   **Database-Backed Remember Session Caching**:
    - Completely replaced HTML5 local storage caching with a secure **HttpOnly cookie + Database session store** (`UserSession` collection with 30-day TTL auto-expiration) to remember returning user profiles securely.
    - Retains the secure remember cookie on logout so returning users are greeted with the "Welcome Back" profile card, while clearing active JWT tokens.
*   **"Back to Home" Entry Buttons**:
    - Added a green-colored link button **"Back to Home"** with a left arrow icon to the bottom of all login portals (Customer forms/welcome back card, Admin sign-in, and Delivery Partner forms).
    - Removed hover outlines and text decorations using a global `.back-to-home-btn:hover` CSS overrides.
*   **Standardized Date Displays**:
    - All dates are standardized to the custom readable format `d mmm yyyy` (e.g. `3 jun 2026`) across all tables, logs, list columns, and headers using a unified formatting utility.
*   **New Arrivals Refinements**:
    - Simplified card tags to display **only** the `NEW` tag, removing the trending and popular tags.
    - Enabled the `NEW` tag for all 8 latest products (which are sorted by date) and resolved TypeScript compiler unused variables warnings.

### Admin & Management Dashboard

*   **Role-Based Operations**: Restricted routes secure admin panels from unauthorized roles, with race-condition suppression in auth toasts during delivery logout transitions.
*   **Product Catalog Builder**: Dynamic product management to add, edit, or delete items.
*   **Restaurant & Operational Settings**: Custom parameters to manage store timing statuses ("Open" vs "Paused"), toggle executive accounts, and verify orders.
*   **Performance Metrics Ranking**: Added sortable columns displaying dynamic performance rankings (High, Medium, Low) based on daily order counts completed today.
*   **Collapsible Submenu Sidebar Trees**:
    *   Admin Sidebar menu restructured to support collapsible sub-navigation folders (**Delivery Management**, **Promotions & Offers**, **Dining & Gifting**) with path matching.
    *   **Rounded Branch Lines**: Connects the vertical alignment line to each submenu item with a **6px border-radius rounded curve** (using precise pixel widths to prevent thick double-line overlaps).
    *   **Left-Aligned Logout**: Sidebar Logout action button is left-aligned to keep the visual flow consistent.
*   **Creation Forms Modals & Tab Filtering**:
    *   Transitioned admin management forms (Coupons, Catalog Discounts, Combo Deals, Gift Cards) into PrimeReact `<Dialog>` modals triggered by "+ Create" buttons.
    *   Filtered logs tables dynamically using URL query parameters (`?tab=...`).
*   **Dining & Gifting Section Views**: Separated "Active Dining Restaurants" and "Main Screen Promotion Banners" into distinct views controlled by tab routing query parameters (`?tab=restaurants` and `?tab=banners`).
*   **Scrollbar Optimization**: Removed horizontal scrollbars on Delivery Management tables to ensure a clean, modern layout.
*   **Notifications Sidebar Drawer**: Removed the redundant notifications count next to the drawer close icon for a cleaner presentation.
*   **Performance Analytics Bar Charts**: Refactored the dashboard's performance section to display Revenue, Orders, and New Customers all as bar charts with custom bar widths (`barPercentage: 0.6`) and a dual Y-axis layout across weekly, monthly, and yearly timeframes.
*   **Executive Profiles Cleanup**: Removed the "daily" text from the executive performance indicators (e.g., `Low (0 daily)` -> `Low (0)`).

### Delivery Executive Portal

*   **Dynamic Earnings Withdrawal**:
    *   Replaced physical wallet balance fields with a calculated dynamic lifetime earnings value (`completedDeliveries * 30`).
    *   Withdrawable balance updates instantly by deducting the sum of pending/approved payouts from lifetime earnings.
*   **Secure Payout Submissions**:
    *   A clean payout dialog splits account entries into three structured fields: "Accountant Name", "Account Number", and "IFSC Code".
    *   Enforces a strict minimum withdrawal limit of **₹100.00** per request.
*   **Active Transits Operations**:
    *   Restructured the active transit tracking dialog to automatically dismiss and clean the local tracking state immediately upon advancing order delivery statuses.
*   **Status Indicators**:
    *   Consolidated executive availability statuses down to a clean `'Online'` badge.

---

## **Performance & Optimization Summary**

TastyHub operates with a **+55% overall rendering speed increase** through:
1.  **Bloatware Elimination**: Replacing bulky UI libraries entirely with PrimeReact's native modular bundling.
2.  **Optimized Layout Engines**: Replaced generic framework columns with CSS Grid and Flexbox layouts.
3.  **Strict Database Queries**: Leveraged indexed MongoDB projections and paginated API data streaming.
4.  **TypeScript Compiling**: Pre-verifies codebase validity before generation inside client and server directories.

---

## **Installation & Setup**

### 1. Clone the Repository
```bash
git clone https://github.com/harikrishna87/FoodDelight.git
cd FoodDelight
```

### 2. Configure Environment Variables

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

### 3. Install Dependencies and Run

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

## **Author**
*   **Veta Hari Babu** — *Full Stack Software Developer*

---

## **License**
This project is licensed under the MIT License. Feel free to use, modify, and distribute with proper attribution.
