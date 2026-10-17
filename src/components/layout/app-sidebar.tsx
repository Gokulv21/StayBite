import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  BedDouble,
  ChefHat,
  Package,
  Users,
  UserCog,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";
import { useSession } from "@/stores/session-store";
import { hasPermission, type Permission } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  perm: Permission;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard.view" },
  { to: "/rooms", label: "Rooms", icon: BedDouble, perm: "rooms.view" },
  { to: "/pos", label: "POS", icon: ShoppingCart, perm: "pos.use" },
  { to: "/inventory", label: "Inventory", icon: Package, perm: "inventory.view" },
  { to: "/staff", label: "Staff", icon: UserCog, perm: "staff.view" },
  { to: "/customers", label: "Customers", icon: Users, perm: "customers.view" },
  { to: "/accounting", label: "Accounts", icon: Wallet, perm: "accounting.view" },
  { to: "/reports", label: "Reports", icon: BarChart3, perm: "reports.view" },
  { to: "/kds", label: "Kitchen", icon: ChefHat, perm: "kds.view" },
  { to: "/settings", label: "Settings", icon: Settings, perm: "settings.view" },
];

export function AppSidebar() {
  const user = useSession((s) => s.user);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="hidden md:flex floating-dock">
      {NAV_ITEMS.map((item) => {
        if (user && !hasPermission(user.role, item.perm)) return null;
        const Icon = item.icon;
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn("dock-item", active && "dock-item-active")}
            title={item.label}
          >
            <Icon className="size-4" />
            <span className="hidden lg:inline text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
