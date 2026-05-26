import Dexie, { Table } from 'dexie';

export interface LocalOrder {
  id?: number;
  uuid: string;
  tableId: string;
  items: any[];
  totalAmount: number;
  status: string;
  synced: boolean;
  timestamp: number;
}

export interface LocalCustomer {
  id?: number;
  uuid: string;
  name: string;
  phone: string;
  synced: boolean;
}

export class StayBiteDatabase extends Dexie {
  orders!: Table<LocalOrder, number>;
  customers!: Table<LocalCustomer, number>;

  constructor() {
    super('StayBiteDB');
    this.version(1).stores({
      orders: '++id, uuid, status, synced, timestamp',
      customers: '++id, uuid, phone, synced'
    });
  }
}

export const db = new StayBiteDatabase();
