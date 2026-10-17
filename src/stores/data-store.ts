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
  checkinDate?: string;
  checkoutDate?: string;
  nights?: number;
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
  checkinDate?: string;
  checkoutDate?: string;
  nights?: number;
  roomRate: number;
  completedOrders: Array<{ description: string; amount: number }>;
  ordersTotal: number;
  grandTotal: number;
  paymentMethod: string;
  splitPayments?: Array<{ method: string; amount: number }>;
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
  /** Single category string — used by guest ordering portal */
  category?: string;
  gst?: number;
  type?: "Veg" | "Non-Veg";
  /** Convenience alias for type === "Veg" — used by guest ordering portal */
  isVeg?: boolean;
  /** Optional menu item description */
  description?: string;
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
  transferTableToRoom: (tableId: string, roomNumber: string) => boolean;
  
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
  resetAllData: () => void;
  loadDemoStarterData: () => void;
}

const INITIAL_SETTINGS: AppSettings = {
  hotelName: "StayBite Suite",
  gstin: "",
  taxRate: 18,
  autoDecrementInventory: true,
  lowStockThreshold: 5,
  themeMode: "light",
  themePalette: "indigo"
};

const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_INVOICES: Invoice[] = [];
const INITIAL_STAFF: Staff[] = [];
const INITIAL_INVENTORY: InventoryItem[] = [];
const INITIAL_ROOMS: RoomData[] = [];
const INITIAL_MENU: MenuItem[] = [];
const INITIAL_TXNS: Transaction[] = [];
const INITIAL_TICKETS: Ticket[] = [];
const INITIAL_TABLES: TableData[] = [];

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      rooms: INITIAL_ROOMS,
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
      transferTableToRoom: (tableId, roomNumber) => {
        const state = useDataStore.getState();
        const table = state.tables.find(t => t.id === tableId);
        if (!table || table.billAmount <= 0) return false;
        
        const room = state.rooms.find(r => r.number === roomNumber && r.status === "occupied");
        if (!room) return false;

        const transferredOrder: RoomOrder = {
          id: `TRF-${Date.now()}`,
          description: `Transferred Restaurant Bill (${tableId})`,
          amount: table.billAmount,
          time: new Date().toISOString(),
          status: "completed"
        };

        set((s) => ({
          tables: s.tables.map(t => t.id === tableId ? { ...t, status: "available", billAmount: 0 } : t),
          rooms: s.rooms.map(r => r.number === roomNumber ? { ...r, orders: [...(r.orders || []), transferredOrder] } : r)
        }));

        return true;
      },
      
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
      resetAllData: () => set({
        rooms: [],
        customers: [],
        invoices: [],
        staffList: [],
        tables: [],
        inventory: [],
        menuItems: [],
        cart: [],
        transactions: [],
        kdsTickets: [],
      }),
      loadDemoStarterData: () => set({
        rooms: [
          { number: "101", status: "available", type: "Standard AC", price: "2500", capacity: "2", size: "240", bedType: "Queen", view: "City View", smoking: "Non-Smoking", amenities: ["Free High-Speed WiFi", "Split AC", "Hot Water"], orders: [] },
          { number: "102", status: "available", type: "Deluxe Suite", price: "4200", capacity: "2", size: "320", bedType: "King Bed", view: "Garden View", smoking: "Non-Smoking", amenities: ["Free High-Speed WiFi", "Mini-bar", "Smart TV", "Room Service"], orders: [] },
          { number: "103", status: "available", type: "Standard AC", price: "2500", capacity: "2", size: "240", bedType: "Twin Beds", view: "Courtyard", smoking: "Non-Smoking", amenities: ["Free High-Speed WiFi", "Split AC"], orders: [] },
          { number: "104", status: "available", type: "Executive Suite", price: "5500", capacity: "3", size: "420", bedType: "King + Single", view: "Temple View", smoking: "Non-Smoking", amenities: ["Free WiFi", "Balcony", "Bathtub", "Welcome Drink"], orders: [] },
          { number: "201", status: "available", type: "Deluxe Suite", price: "4200", capacity: "3", size: "320", bedType: "King Bed", view: "City View", smoking: "Non-Smoking", amenities: ["Free WiFi", "Mini-bar"], orders: [] },
          { number: "202", status: "available", type: "Standard AC", price: "2500", capacity: "2", size: "240", bedType: "Queen", view: "Garden", smoking: "Non-Smoking", amenities: ["Free WiFi"], orders: [] },
        ],
        tables: Array.from({ length: 8 }).map((_, i) => ({ id: `T-${i + 1}`, status: "available", billAmount: 0 })),
        menuItems: [
          { id: "M-101", name: "Chettinad Chicken Biryani", price: 280, categories: ["Biryani", "Dinner", "Non-Veg"], gst: 5, type: "Non-Veg", isAvailable: true },
          { id: "M-102", name: "Seeraga Samba Mutton Biryani", price: 360, categories: ["Biryani", "Dinner", "Non-Veg"], gst: 5, type: "Non-Veg", isAvailable: true },
          { id: "M-103", name: "Ghee Roast Masala Dosa", price: 140, categories: ["Tiffin", "Breakfast", "Veg"], gst: 5, type: "Veg", isAvailable: true },
          { id: "M-104", name: "Crispy Chicken 65 Boneless", price: 210, categories: ["Starters", "Non-Veg"], gst: 5, type: "Non-Veg", isAvailable: true },
          { id: "M-105", name: "Paneer Butter Masala", price: 220, categories: ["Curries", "Veg"], gst: 5, type: "Veg", isAvailable: true },
          { id: "M-106", name: "Butter Naan (2 Pcs)", price: 70, categories: ["Breads", "Veg"], gst: 5, type: "Veg", isAvailable: true },
          { id: "M-107", name: "Authentic Madras Filter Coffee", price: 45, categories: ["Beverages", "Hot Drinks", "Veg"], gst: 5, type: "Veg", isAvailable: true },
        ],
        inventory: [
          { id: "INV-001", name: "Seeraga Samba Biryani Rice", category: "Food", quantity: 100, unit: "kg", status: "In Stock" },
          { id: "INV-002", name: "Fresh Country Chicken", category: "Food", quantity: 30, unit: "kg", status: "In Stock" },
          { id: "INV-003", name: "Pure Cow Ghee", category: "Food", quantity: 20, unit: "liters", status: "In Stock" },
          { id: "INV-004", name: "Fresh Dairy Milk", category: "Beverage", quantity: 40, unit: "liters", status: "In Stock" },
        ],
        customers: [],
        invoices: [],
        transactions: [],
        kdsTickets: [],
      }),
    }),
    {
      name: "staybite_data_v2",
      onRehydrateStorage: () => () => {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem("staybite_data");
        }
      },
    }
  )
);
