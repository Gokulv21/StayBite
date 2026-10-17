# StayBite — Harmony Hospitality Suite 🏨🍽️

StayBite is an all-in-one, modern Enterprise Resource Planning (ERP) platform designed specifically for hospitality businesses that manage both **hotel rooms** and **restaurant/dining operations**. 

It serves as the digital brain of a hotel-restaurant hybrid, seamlessly linking room service, front-desk bookings, restaurant dining tables, and kitchen workflows into a single system.

---

## 🎯 Who is StayBite for?

Managing rooms and dining services separately is a headache for hospitality owners. StayBite is designed for:
1. **Boutique Hotels & Resorts:** Businesses that offer both accommodations and in-house dining/room service.
2. **Bed & Breakfasts (B&Bs) & Guest Houses:** Small-to-medium stays looking for an easy way to track guest stays, breakfasts, and extra charges.
3. **Hybrid Pubs/Inns:** Establishments that have rooms upstairs and a bar/restaurant downstairs.
4. **Hotel Owners & General Managers:** Who want a single dashboard to track overall occupancy, restaurant sales, inventory, and staff shifts.

---

## 🚀 Core Features & How They Help

### 1. Front Desk & Room Management (`/rooms`)
A visual dashboard representing the entire hotel layout.
* **How it works:** Receptionists can view a live grid of all rooms colored by status (Available, Occupied, Out-of-Service, Needs Cleaning). Selecting a room allows for instant check-in (inputting guest name, phone number, occupancy limit, Aadhar/Passport ID, checkout date) or check-out.
* **Who it helps:** **Front Desk Receptionists** can manage bookings in seconds without messy paperwork. **Housekeeping Staff** can see which rooms are vacant and ready for cleaning.
* **Key Benefits:** Prevents double-booking and speeds up the check-in process.

### 2. Point of Sale (POS) Terminal (`/pos`)
A fast, modern touch interface for placing restaurant and room service orders.
* **How it works:** Waiters can select food items from categorised menus (Breakfast, Starters, Mains, Desserts, Drinks), customize quantities, and assign orders to specific tables (e.g., Table 12) or room numbers (e.g., Room 104).
* **Who it helps:** **Waiters & Restaurant Cashiers**. They can take orders rapidly and instantly charge meals directly to a guest's room bill (Room Folio) instead of making them pay immediately.
* **Key Benefits:** Faster service, fewer billing mistakes, and effortless room-service management.

### 3. Kitchen Display System (KDS) (`/kds`)
A real-time monitor placed in the kitchen that displays active food orders.
* **How it works:** When an order is placed on the POS, it immediately appears on the KDS screen as a digital ticket. Chefs can view prep instructions, see how long an order has been waiting, and mark tickets as "Done" or "Preparing".
* **Who it helps:** **Chefs & Kitchen Staff**.
* **Key Benefits:** Replaces unreliable paper tickets, reduces noise in the kitchen, and ensures food is prepared in the correct order.

### 4. Real-time Inventory & Stock Tracking (`/inventory`)
Tracks the ingredients and goods used by the kitchen and hotel.
* **How it works:** Keeps a database of current stock levels. When a dish is ordered at the POS, the system automatically decrements the stock levels of the ingredients required. The system flags items when they fall below a safe threshold.
* **Who it helps:** **Inventory Managers & Kitchen Administrators**.
* **Key Benefits:** Prevents running out of popular items and flags potential food wastage or theft.

### 5. Billing & Accounting (`/accounting` & `/reports`)
An easy-to-use ledger tracking all money flowing in and out of the business.
* **How it works:** The system auto-generates invoice receipts during room check-out, combining room charges, taxes (GST), and restaurant orders into one bill. It also lets owners log overhead expenses (e.g., electricity, purchasing ingredients).
* **Who it helps:** **Accountants, Hotel Managers, and Business Owners**.
* **Key Benefits:** Eliminates the need for separate accounting software and provides instant profit/loss statements.

### 6. Customer CRM & Loyalty (`/customers`)
A database of everyone who has stayed or dined at the establishment.
* **How it works:** Stores guest contact details, purchase history, and automatically tracks visit counts or loyalty points.
* **Who it helps:** **Marketing Teams & Owners**.
* **Key Benefits:** Allows hosts to welcome returning customers by name and run targeted promotional offers.

### 7. Staff & Shift Scheduler (`/staff`)
An administrative tool to organize the workforce.
* **How it works:** Set employee roles (e.g., Waiter, Chef, Receptionist, Manager), schedule weekly shifts, and log monthly salaries.
* **Who it helps:** **HR Managers & Business Owners**.
* **Key Benefits:** Reduces scheduling conflicts and makes monthly salary payments simple.

---

## 🛠️ The Technical Stack

StayBite uses a robust and modern architecture to ensure high speed, real-time sync, and security:

* **Frontend (User Interface):**
  * **React & TypeScript:** Built for a fast, responsive, and type-safe user experience.
  * **TanStack Router:** Handles smooth transitions between pages and ensures accurate URL states.
  * **Tailwind CSS & shadcn/ui:** Offers a premium, clean design with dark-mode elements and fluid layout components.
  * **Zustand / Custom Stores:** Manages client-side state smoothly, making sure the UI responds instantly to user input.

* **Backend (Data & Logic):**
  * **Java 21 & Spring Boot:** The industry standard for building powerful, reliable, and secure enterprise servers.
  * **Spring Security:** Keeps guest information, financial data, and credentials safe.
  * **WebSockets:** Sends instant notifications from the POS terminal to the KDS (Kitchen screen) without requiring page refreshes.
  * **PostgreSQL:** A highly reliable relational database that stores room lists, guest histories, and billing data safely.
  * **Redis:** Powers lightning-fast caching to speed up search results and session management.
