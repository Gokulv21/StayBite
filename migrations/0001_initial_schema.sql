-- Cloudflare D1 Serverless SQL Schema for StayBite Suite

-- 1. Branches & Hotel Tenants
CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms & Lodging
CREATE TABLE IF NOT EXISTS rooms (
    number TEXT PRIMARY KEY,
    branch_id TEXT DEFAULT 'main',
    status TEXT NOT NULL DEFAULT 'available',
    type TEXT,
    price REAL DEFAULT 1000,
    capacity TEXT DEFAULT '2',
    size TEXT DEFAULT '300',
    bed_type TEXT DEFAULT 'Queen',
    view TEXT DEFAULT 'City View',
    smoking TEXT DEFAULT 'Non-Smoking',
    amenities TEXT, -- JSON array
    guest_name TEXT,
    guest_phone TEXT,
    guests_count TEXT,
    id_type TEXT,
    id_number TEXT,
    checkin_date TEXT,
    checkout_date TEXT,
    nights INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Room Folio Orders
CREATE TABLE IF NOT EXISTS room_orders (
    id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    FOREIGN KEY(room_number) REFERENCES rooms(number) ON DELETE CASCADE
);

-- 4. Restaurant Tables
CREATE TABLE IF NOT EXISTS dining_tables (
    id TEXT PRIMARY KEY,
    branch_id TEXT DEFAULT 'main',
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available',
    bill_amount REAL DEFAULT 0,
    active_order_id TEXT
);

-- 5. Digital Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    is_veg INTEGER DEFAULT 1, -- 1 = true, 0 = false
    description TEXT,
    image_url TEXT,
    is_available INTEGER DEFAULT 1
);

-- 6. Kitchen Display (KDS) Tickets
CREATE TABLE IF NOT EXISTS kds_tickets (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    items TEXT NOT NULL, -- JSON array of strings
    elapsed INTEGER DEFAULT 0,
    urgent INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Invoices & Billing
CREATE TABLE IF NOT EXISTS invoices (
    invoice_no TEXT PRIMARY KEY,
    room_number TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    guest_phone TEXT,
    checkin_date TEXT,
    checkout_date TEXT,
    nights INTEGER DEFAULT 1,
    room_rate REAL NOT NULL,
    orders_total REAL DEFAULT 0,
    grand_total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    split_payments TEXT, -- JSON
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Customer CRM & Loyalty
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    visits INTEGER DEFAULT 1,
    loyalty TEXT DEFAULT 'Bronze',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Inventory Stock Items
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    min_threshold REAL DEFAULT 5,
    unit_cost REAL DEFAULT 0
);

-- 10. Financial Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- Income, Expense
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
