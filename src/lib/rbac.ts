// Role-Based Access Control matrix.
// All role + permission checks in the app go through this module.

export type Role =
  | "super_admin"
  | "owner"
  | "branch_manager"
  | "receptionist"
  | "cashier"
  | "waiter"
  | "kitchen"
  | "housekeeping"
  | "accountant"
  | "inventory_manager";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  owner: "Owner",
  branch_manager: "Branch Manager",
  receptionist: "Receptionist",
  cashier: "Cashier",
  waiter: "Waiter",
  kitchen: "Kitchen Staff",
  housekeeping: "Housekeeping",
  accountant: "Accountant",
  inventory_manager: "Inventory Manager",
};

export type Permission =
  | "dashboard.view"
  | "pos.use"
  | "pos.refund"
  | "rooms.view"
  | "rooms.checkin"
  | "rooms.checkout"
  | "kds.view"
  | "inventory.view"
  | "inventory.edit"
  | "staff.view"
  | "staff.edit"
  | "customers.view"
  | "accounting.view"
  | "reports.view"
  | "settings.view"
  | "settings.edit"
  | "branches.manage";

const ALL: Permission[] = [
  "dashboard.view","pos.use","pos.refund","rooms.view","rooms.checkin","rooms.checkout",
  "kds.view","inventory.view","inventory.edit","staff.view","staff.edit","customers.view",
  "accounting.view","reports.view","settings.view","settings.edit","branches.manage",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL,
  owner: ALL,
  branch_manager: ALL.filter((p) => p !== "branches.manage"),
  receptionist: ["dashboard.view","rooms.view","rooms.checkin","rooms.checkout","customers.view"],
  cashier: ["dashboard.view","pos.use","pos.refund","customers.view"],
  waiter: ["pos.use","kds.view"],
  kitchen: ["kds.view","inventory.view"],
  housekeeping: ["rooms.view"],
  accountant: ["dashboard.view","accounting.view","reports.view"],
  inventory_manager: ["dashboard.view","inventory.view","inventory.edit","reports.view"],
};

export function hasPermission(role: Role, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}
