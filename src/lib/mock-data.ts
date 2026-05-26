// Demo data for Phase 1 foundation UI. Replace with API calls when backend is wired.
import type { RoomStatus } from "@/components/room-status-grid";

export function mockRooms(): Array<{ number: string; status: RoomStatus }> {
  return [
    { number: "101", status: "occupied" },
    { number: "102", status: "occupied" },
    { number: "103", status: "cleaning" },
    { number: "104", status: "available" },
    { number: "105", status: "occupied" },
    { number: "106", status: "maintenance" },
    { number: "107", status: "available" },
    { number: "108", status: "occupied" },
    { number: "109", status: "available" },
    { number: "110", status: "occupied" },
  ];
}

export function mockRevenueSeries() {
  return [
    { day: "Mon", rooms: 52000, restaurant: 18000 },
    { day: "Tue", rooms: 54000, restaurant: 21000 },
    { day: "Wed", rooms: 48000, restaurant: 19500 },
    { day: "Thu", rooms: 61000, restaurant: 26000 },
    { day: "Fri", rooms: 72000, restaurant: 31000 },
    { day: "Sat", rooms: 76000, restaurant: 34000 },
    { day: "Sun", rooms: 70000, restaurant: 29000 },
  ];
}

export interface MockTxn {
  id: string;
  guest: string;
  channel: "Room" | "Restaurant" | "Bar";
  status: "Completed" | "Pending" | "Refunded";
  amount: number;
  at: string;
}

export function mockTransactions(): MockTxn[] {
  return [
    { id: "TXN-9012", guest: "Room 102 / Rajesh", channel: "Room", status: "Completed", amount: 6800, at: "09:20" },
    { id: "TXN-9013", guest: "Table T-4", channel: "Restaurant", status: "Pending", amount: 1450, at: "10:05" },
    { id: "TXN-9014", guest: "Room 108 / Priya", channel: "Bar", status: "Completed", amount: 890, at: "11:12" },
    { id: "TXN-9015", guest: "Table T-9", channel: "Restaurant", status: "Refunded", amount: -420, at: "12:18" },
    { id: "TXN-9016", guest: "Room 110 / Amit", channel: "Room", status: "Completed", amount: 9200, at: "13:04" },
    { id: "TXN-9017", guest: "Table T-2", channel: "Restaurant", status: "Completed", amount: 2300, at: "14:37" },
  ];
}
