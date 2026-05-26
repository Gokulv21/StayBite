import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoomStatus } from "@/components/room-status-grid";

export interface RoomOrder {
  id: string;
  description: string;
  amount: number;
  time: string;
  status?: "pending" | "completed";
}

export interface RoomData {
  number: string;
  status: RoomStatus;
  type?: string;
  price?: string;
  capacity?: string;
  size?: string;
  bedType?: string;
  view?: string;
  smoking?: string;
  amenities?: string[];
  orders?: RoomOrder[];
  guestName?: string;
  guestPhone?: string;
  guestsCount?: string;
  idType?: string;
  idNumber?: string;
  checkoutDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  loyalty: "Gold" | "Silver" | "Bronze";
}

export interface Invoice {
  invoiceNo: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  idType?: string;
  idNumber?: string;
  checkoutDate?: string;
  roomRate: number;
  completedOrders: Array<{ description: string; amount: number }>;
  ordersTotal: number;
  grandTotal: number;
  paymentMethod: string;
  date: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Off-Duty";
  shift: string;
  phone?: string;
  email?: string;
  salary?: number;
  joiningDate?: string;
  salaryHistory?: { date: string; amount: number }[];
  password?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categories?: string[];
  gst?: number;
  type?: "Veg" | "Non-Veg";
  isAvailable?: boolean;
}

export interface TableData {
  id: string;
  status: "available" | "occupied";
  billAmount: number;
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "Income" | "Expense" | "Tax";
  amount: number;
  method: string;
}

export interface Ticket {
  id: string;
  table: string;
  items: string[];
  elapsed: number;
  urgent: boolean;
  status: "pending" | "completed";
  createdAt?: string;
}

export interface AppSettings {
  hotelName: string;
  gstin: string;
  taxRate: number;
  autoDecrementInventory: boolean;
  lowStockThreshold: number;
  themeMode: "light" | "dark";
  themePalette: "gold" | "emerald" | "indigo" | "sunset" | "rose";
  whatsappApiKey?: string;
}

interface DataStore {
  rooms: RoomData[];
  setRooms: (rooms: RoomData[]) => void;
  chargeRoom: (roomNumber: string, order: RoomOrder) => void;
  clearRoomFolio: (roomNumber: string) => void;
  
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;

  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  
  tables: TableData[];
  setTables: (tables: TableData[]) => void;
  chargeTable: (tableId: string, amount: number) => void;
  clearTable: (tableId: string) => void;
  
  staffList: Staff[];
  setStaffList: (staff: Staff[]) => void;
  
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[] | ((prev: MenuItem[]) => MenuItem[])) => void;
  
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;

  kdsTickets: Ticket[];
  setKdsTickets: (tickets: Ticket[]) => void;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  decrementInventoryForOrder: (items: Array<{ name: string; qty: number }>) => void;
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "C-001",
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh.k@gmail.com",
    visits: 2,
    loyalty: "Gold"
  },
  {
    id: "C-002",
    name: "Priya Sharma",
    phone: "9123456789",
    email: "priya.s@yahoo.com",
    visits: 1,
    loyalty: "Silver"
  },
  {
    id: "C-003",
    name: "Amit Patel",
    phone: "8765432109",
    email: "amit.p@outlook.com",
    visits: 1,
    loyalty: "Bronze"
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    invoiceNo: "INV-873641",
    roomNumber: "102",
    guestName: "Rajesh Kumar",
    guestPhone: "9876543210",
    idType: "Aadhar",
    idNumber: "1234 5678 9012",
    checkoutDate: "2026-05-10",
    roomRate: 5000,
    completedOrders: [
      { description: "2× Wagyu Sliders", amount: 1200 },
      { description: "1× Truffle Fries", amount: 500 }
    ],
    ordersTotal: 1700,
    grandTotal: 6700,
    paymentMethod: "Credit Card",
    date: "10/05/2026"
  },
  {
    invoiceNo: "INV-928135",
    roomNumber: "204",
    guestName: "Rajesh Kumar",
    guestPhone: "9876543210",
    idType: "Aadhar",
    idNumber: "1234 5678 9012",
    checkoutDate: "2026-05-18",
    roomRate: 8000,
    completedOrders: [],
    ordersTotal: 0,
    grandTotal: 8000,
    paymentMethod: "UPI",
    date: "18/05/2026"
  },
  {
    invoiceNo: "INV-512943",
    roomNumber: "105",
    guestName: "Priya Sharma",
    guestPhone: "9123456789",
    idType: "Passport",
    idNumber: "Z9876543",
    checkoutDate: "2026-05-14",
    roomRate: 3500,
    completedOrders: [
      { description: "1× Club Sandwich", amount: 350 },
      { description: "1× Diet Coke", amount: 120 }
    ],
    ordersTotal: 470,
    grandTotal: 3970,
    paymentMethod: "Cash",
    date: "14/05/2026"
  },
  {
    invoiceNo: "INV-384102",
    roomNumber: "301",
    guestName: "Amit Patel",
    guestPhone: "8765432109",
    idType: "Driving License",
    idNumber: "DL-1234567890",
    checkoutDate: "2026-05-19",
    roomRate: 12000,
    completedOrders: [
      { description: "Room Service - Dinner Deluxe", amount: 2500 }
    ],
    ordersTotal: 2500,
    grandTotal: 14500,
    paymentMethod: "Bank Transfer",
    date: "19/05/2026"
  }
];

const INITIAL_SETTINGS: AppSettings = {
  hotelName: "StayBite Residency",
  gstin: "33AAAAA1111A1Z1",
  taxRate: 18,
  autoDecrementInventory: true,
  lowStockThreshold: 5,
  themeMode: "dark",
  themePalette: "indigo"
};

const INITIAL_STAFF: Staff[] = [];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "INV-001", name: "Potatoes", category: "Food", quantity: 150, unit: "kg", status: "In Stock" },
  { id: "INV-002", name: "Burger Buns", category: "Food", quantity: 80, unit: "pcs", status: "In Stock" },
  { id: "INV-003", name: "Wagyu Beef Patty", category: "Food", quantity: 60, unit: "pcs", status: "In Stock" },
  { id: "INV-004", name: "Lettuce", category: "Food", quantity: 12, unit: "kg", status: "In Stock" },
  { id: "INV-005", name: "Tomatoes", category: "Food", quantity: 25, unit: "kg", status: "In Stock" },
  { id: "INV-006", name: "Diet Coke", category: "Beverage", quantity: 120, unit: "cans", status: "In Stock" },
  { id: "INV-007", name: "Truffle Oil", category: "Food", quantity: 4, unit: "liters", status: "Low Stock" },
  { id: "INV-008", name: "Hotel Bath Soap", category: "Supplies", quantity: 200, unit: "pcs", status: "In Stock" },
  { id: "INV-009", name: "White Bed Sheets", category: "Supplies", quantity: 45, unit: "pcs", status: "In Stock" }
];

const INITIAL_MENU: MenuItem[] = [];
const INITIAL_TXNS: Transaction[] = [];
const INITIAL_TICKETS: Ticket[] = [];
const INITIAL_TABLES: TableData[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `T-${i + 1}`,
  status: "available",
  billAmount: 0
}));

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      rooms: [],
      setRooms: (rooms) => set({ rooms }),
      chargeRoom: (roomNumber, order) => set((state) => ({
        rooms: state.rooms.map(r => 
          r.number === roomNumber 
            ? { ...r, orders: [...(r.orders || []), order] }
            : r
        )
      })),
      clearRoomFolio: (roomNumber) => set((state) => ({
        rooms: state.rooms.map(r => 
          r.number === roomNumber 
            ? { ...r, orders: [] }
            : r
        )
      })),
      
      customers: INITIAL_CUSTOMERS,
      setCustomers: (customers) => set({ customers }),

      invoices: INITIAL_INVOICES,
      setInvoices: (invoices) => set({ invoices }),
      
      staffList: INITIAL_STAFF,
      setStaffList: (staffList) => set({ staffList }),

      tables: INITIAL_TABLES,
      setTables: (tables) => set({ tables }),
      chargeTable: (tableId, amount) => set((state) => ({
        tables: state.tables.map(t => 
          t.id === tableId 
            ? { ...t, status: "occupied", billAmount: t.billAmount + amount }
            : t
        )
      })),
      clearTable: (tableId) => set((state) => ({
        tables: state.tables.map(t => 
          t.id === tableId 
            ? { ...t, status: "available", billAmount: 0 }
            : t
        )
      })),
      
      inventory: INITIAL_INVENTORY,
      setInventory: (inventory) => set({ inventory }),
      
      menuItems: INITIAL_MENU,
      setMenuItems: (menuItems) => set((state) => ({
        menuItems: typeof menuItems === 'function' ? menuItems(state.menuItems) : menuItems
      })),
      
      cart: [],
      setCart: (cartOrFn) => set((state) => ({ 
        cart: typeof cartOrFn === 'function' ? cartOrFn(state.cart) : cartOrFn 
      })),
      
      transactions: INITIAL_TXNS,
      setTransactions: (transactions) => set({ transactions }),

      kdsTickets: INITIAL_TICKETS,
      setKdsTickets: (kdsTickets) => set({ kdsTickets }),

      settings: INITIAL_SETTINGS,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...(state.settings || INITIAL_SETTINGS), ...newSettings }
      })),
      decrementInventoryForOrder: (items) => set((state) => {
        const settings = state.settings || INITIAL_SETTINGS;
        if (!settings.autoDecrementInventory) return {};

        const updatedInventory = state.inventory.map(invItem => {
          let deductQty = 0;
          items.forEach(cartItem => {
            const cName = cartItem.name.toLowerCase();
            const iName = invItem.name.toLowerCase();

            if (iName === cName || cName.includes(iName) || iName.includes(cName)) {
              deductQty += cartItem.qty;
            }
            else if (cName.includes("wagyu sliders") || cName.includes("burger")) {
              if (iName.includes("bun")) deductQty += 2 * cartItem.qty;
              if (iName.includes("beef") || iName.includes("wagyu")) deductQty += 1 * cartItem.qty;
              if (iName.includes("lettuce")) deductQty += 0.05 * cartItem.qty;
              if (iName.includes("tomato")) deductQty += 0.1 * cartItem.qty;
            }
            else if (cName.includes("truffle fries") || cName.includes("fries")) {
              if (iName.includes("potato")) deductQty += 0.4 * cartItem.qty;
              if (iName.includes("truffle")) deductQty += 0.02 * cartItem.qty;
            }
            else if (cName.includes("club sandwich") || cName.includes("sandwich")) {
              if (iName.includes("sandwich")) deductQty += cartItem.qty;
              else if (iName.includes("bread")) deductQty += 2 * cartItem.qty;
            }
          });

          if (deductQty > 0) {
            const newQty = Math.max(0, invItem.quantity - deductQty);
            let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
            if (newQty === 0) status = "Out of Stock";
            else if (newQty <= settings.lowStockThreshold) status = "Low Stock";

            return {
              ...invItem,
              quantity: Number(newQty.toFixed(2)),
              status
            };
          }
          return invItem;
        });

        return { inventory: updatedInventory };
      }),
    }),
    { name: "staybite_data" }
  )
);
