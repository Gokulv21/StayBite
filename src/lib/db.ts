// Local-first IndexedDB (Dexie) storage layer.
// All POS / booking / order writes flow through here first, then sync to the
// remote backend in the background. This file defines the schema; sync engine
// will live in src/lib/sync.ts (Phase 2).

import Dexie, { type Table } from "dexie";

export interface SyncMeta {
  syncedAt: number | null; // null = pending sync
  updatedAt: number;
  deletedAt: number | null;
}

export interface OutboxItem {
  id?: number;
  entity: string; // table name
  entityId: string;
  op: "create" | "update" | "delete";
  payload: unknown;
  createdAt: number;
  attempts: number;
  lastError?: string;
}

export interface OrderRecord extends SyncMeta {
  id: string;
  branchId: string;
  tableId?: string;
  roomId?: string;
  type: "dine_in" | "takeaway" | "delivery" | "room_service";
  status: "open" | "sent_to_kitchen" | "ready" | "served" | "paid" | "void";
  items: Array<{ menuItemId: string; name: string; qty: number; price: number; notes?: string }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdBy: string;
}

export interface BookingRecord extends SyncMeta {
  id: string;
  branchId: string;
  roomId: string;
  customerId: string;
  checkIn: number;
  checkOut: number;
  status: "reserved" | "checked_in" | "checked_out" | "cancelled";
  totalAmount: number;
}

export interface CustomerRecord extends SyncMeta {
  id: string;
  branchId: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
}

class HotelDB extends Dexie {
  orders!: Table<OrderRecord, string>;
  bookings!: Table<BookingRecord, string>;
  customers!: Table<CustomerRecord, string>;
  outbox!: Table<OutboxItem, number>;

  constructor() {
    super("hotel_pos_local");
    this.version(1).stores({
      orders: "id, branchId, status, updatedAt, syncedAt",
      bookings: "id, branchId, roomId, status, checkIn, updatedAt, syncedAt",
      customers: "id, branchId, phone, name, updatedAt, syncedAt",
      outbox: "++id, entity, entityId, createdAt",
    });
  }
}

export const db = new HotelDB();

export async function enqueue(
  entity: OutboxItem["entity"],
  entityId: string,
  op: OutboxItem["op"],
  payload: unknown,
) {
  await db.outbox.add({
    entity,
    entityId,
    op,
    payload,
    createdAt: Date.now(),
    attempts: 0,
  });
}
