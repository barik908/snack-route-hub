# TKG Eats Hub

Act as a Principal Full-Stack Web Developer & UI/UX Architect. Your task is to design, architect, and build a complete, production-ready, highly modular, fully functional, multi-vendor food delivery web application named "TKG Snacks". 

The system must support unlimited registered restaurants/vendors, dynamic product & category management, granular shop isolation, secure password-based multi-panel role switching, dynamic order management, printable invoices, sound alerts, map integration, and dedicated delivery rider tracking.

---

1. SYSTEM ARCHITECTURE & ROLE ISOLATION

The application must strictly separate functionality into 4 isolated dynamic modules:

1. Customer Frontend Website (Public Storefront)

2. Super Admin Master Control Panel (Global Management + Direct Shop Drill-down)

3. Vendor / Shopkeeper Panel (Individual Shop Management)

4. Delivery Rider Panel (Individual Order & Navigation Management)

---

2. CORE SECURITY & AUTHENTICATION SPECIFICATIONS

* Hidden Panel Access Triggers (Footer Integration):

  * The public customer frontend must show NO visible navigation links, toggles, or headers for login or administrative access.

  * Discrete trigger icons must be embedded quietly in the Website Footer:

    * Lock Icon -> Opens Admin Login Modal (Default Password: `qwertyuiop`).

    * Store Icon -> Opens Vendor Login Modal (Requires Vendor Phone/ID + Unique Vendor Password).

    * Rider Icon -> Opens Delivery Rider Login Modal (Requires Rider Phone/ID + Unique Rider Password).

* Role-Based Isolation Rules:

  * Vendor Isolation: Each registered vendor/shopkeeper must log in with their unique credentials. They MUST ONLY have access to their own store's dashboard, menu items, stock status, pricing, and specific incoming orders. They must NEVER see or modify another vendor's data.

  * Rider Isolation: Each delivery rider logs in individually and must only see orders assigned specifically to them.

  * Super Admin Override: Super Admin possesses global control, master access to all stores, and the capability to override any password or setting.

---

3. SUPER ADMIN CONTROL PANEL (MASTER CONTROL)

* Global Site Settings Management:

  * Dynamically update Website Name (TKG Snacks), Brand Logo URL, Primary Contact Phone (01581029536), Default Location (Thakurgaon), Global Delivery Charges, and Panel Access Passwords.

* Interactive Store Card View & Drill-Down Management (CRITICAL):

  * Display all registered restaurants/shops as visual Store Cards / Boxes in a grid layout.

  * Each store card must display: Shop Logo, Shop Name, Owner Phone Number, Address, Total Items Count, and Active/Inactive Status.

  * Direct Store Management: Clicking on any Store Card allows the Admin to "Enter Shop Mode" to directly manage that specific store’s menu items, change prices, toggle stock status (In Stock / Out of Stock), view store-specific sales history, or reset that vendor's login password.

* Global Category CRUD: Full Add/Edit/Delete control over dynamic food categories (e.g., Fast Food, Biryani, Pizza, Snacks, Drinks, Bakery, etc.).

* Global Rider Management: Add, edit, or remove delivery riders with detailed profiles (Name, Phone Number, Vehicle Type, License/ID details).

* Global Order Routing & Real-Time Analytics: View live system-wide orders, track real-time analytics (Total Revenue, Active Orders, Delivered Count), update order statuses (Pending, Preparing, Assigned to Rider, Out for Delivery, Delivered, Cancelled), and assign or re-assign orders to available riders.

---

4. VENDOR / SHOPKEEPER PANEL

* Dedicated Shop Dashboard: Overview showing daily sales totals, active incoming orders, completed order history, and stock metrics.

* Menu & Inventory Control:

  * Add, edit, or remove food items specific to their shop.

  * Set prices, upload/link item images, and assign items to global categories.

  * Stock Toggle: Instant toggle switch for every menu item to set status as In Stock or Out of Stock.

* Real-Time Order Processing:

  * Live audio chime/sound alert and visual notification when a new order arrives for their store.

  * Ability to update preparation status (Preparing -> Ready for Pickup).

---

5. DELIVERY RIDER PANEL

* Dedicated Rider Dashboard: Displays rider status, total cash collected, and assigned active delivery tasks.

* Online/Offline Status Toggle: Switch status between Available, On Delivery, and Offline.

* Order Execution Details: Itemized list of foods, customer name, primary phone number, secondary phone number, exact Cash on Delivery (COD) amount to collect, and precise delivery address with nearby landmarks.

* Navigation & Completion: Direct interactive map button/link for turn-by-turn navigation to customer address, and a single-tap "Mark as Delivered" button that updates status system-wide.

---

6. CUSTOMER FRONTEND WEBSITE

* Header & Search Bar:

  * Clean branding featuring TKG Snacks, dynamic search bar (instant live search by item name, category, or restaurant name), and editable contact header (Phone: 01581029536, Location: Thakurgaon).

* Dynamic Category & Shop Filtering:

  * Category navigation bar with dynamic filtering: Clicking any category filter MUST immediately restrict display to items matching that category.

  * Option to filter items by specific vendor/restaurant.

* Product Cards & Modal View:

  * Responsive mobile-first grid (2 columns on mobile, 4+ on desktop).

  * Product cards showing high-resolution image, price, star ratings, and prominently displaying the Restaurant/Store Name.

  * Clicking a card opens a detailed Product Modal with full description and ingredients.

* Checkout & Instant Cash Memo Generation:

  * Checkout modal requesting: Customer Name, Primary Phone Number, Secondary Phone Number (Optional), and Delivery Address with nearby landmark notes.

  * Instant Receipt: Submitting an order instantly generates a downloadable and printable Digital Cash Memo / Receipt Ticket summarizing order ID, customer details, shop name, itemized bill, delivery charge, total price, and COD instructions.

---

7. UI/UX & STYLING SPECIFICATIONS

* Color Palette: Modern dark theme background paired with rich golden-yellow (#FFB703) and warm vibrant orange (#FB8500) accents matching food branding.

* Responsiveness: 100% Mobile-First responsive design, ensuring smooth transitions, fast loading, and touch-friendly controls across smartphones, tablets, and desktop browsers.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://snack-route-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f2402c2d-9539-4f3c-b3f6-b687c4502f2e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
