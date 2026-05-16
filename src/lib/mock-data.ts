// Demo data for Phase 1 foundation UI. Replace with API calls when backend is wired.
import type { RoomStatus } from "@/components/room-status-grid";

export function mockRooms(): Array<{ number: string; status: RoomStatus }> {
  const statuses: RoomStatus[] = ["available", "occupied", "cleaning", "maintenance", "reserved"];
  const rooms: Array<{ number: string; status: RoomStatus }> = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let r = 1; r <= 10; r++) {
      const num = `${floor}${r.toString().padStart(2, "0")}`;
      // Weighted: more occupied/available than other states
      const pool: RoomStatus[] = [
        "occupied","occupied","occupied","available","available",
        "available","reserved","cleaning","maintenance",
      ];
      rooms.push({ number: num, status: pool[(parseInt(num) + r) % pool.length] ?? statuses[0] });
    }
  }
  return rooms;
}

export function mockRevenueSeries() {
  const data = [];
  const now = Date.now();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    const restaurant = 3000 + Math.round(Math.random() * 4000);
    const rooms = 5000 + Math.round(Math.random() * 6000);
    data.push({
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      restaurant,
      rooms,
    });
  }
  return data;
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
    { id: "PX-9021", guest: "Elena Rodriguez (Rm 304)", channel: "Room", status: "Completed", amount: 420.0, at: "10:41" },
    { id: "PX-9022", guest: "Table 14 — Dinner", channel: "Restaurant", status: "Pending", amount: 184.2, at: "10:38" },
    { id: "PX-9023", guest: "John Smith (Rm 102)", channel: "Room", status: "Completed", amount: 1205.0, at: "10:35" },
    { id: "PX-9024", guest: "Walk-in #44", channel: "Bar", status: "Completed", amount: 64.5, at: "10:30" },
    { id: "PX-9025", guest: "Table 03 — Lunch", channel: "Restaurant", status: "Refunded", amount: -42.0, at: "10:22" },
    { id: "PX-9026", guest: "Aisha Khan (Rm 211)", channel: "Room", status: "Completed", amount: 880.0, at: "10:15" },
  ];
}
