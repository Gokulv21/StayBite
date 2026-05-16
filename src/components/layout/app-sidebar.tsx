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
  Hotel,
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

const SECTIONS: Array<{ heading: string; items: NavItem[] }> = [
  {
    heading: "Operations",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard.view" },
      { to: "/pos", label: "POS Terminal", icon: ShoppingCart, perm: "pos.use" },
      { to: "/rooms", label: "Rooms & Bookings", icon: BedDouble, perm: "rooms.view" },
      { to: "/kds", label: "Kitchen Display", icon: ChefHat, perm: "kds.view" },
    ],
  },
  {
    heading: "Management",
    items: [
      { to: "/inventory", label: "Inventory", icon: Package, perm: "inventory.view" },
      { to: "/customers", label: "Customers", icon: Users, perm: "customers.view" },
      { to: "/staff", label: "Staff", icon: UserCog, perm: "staff.view" },
      { to: "/accounting", label: "Accounting", icon: Wallet, perm: "accounting.view" },
      { to: "/reports", label: "Reports", icon: BarChart3, perm: "reports.view" },
      { to: "/settings", label: "Settings", icon: Settings, perm: "settings.view" },
    ],
  },
];

export function AppSidebar() {
  const user = useSession((s) => s.user);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-14 flex items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="size-7 rounded-md bg-primary grid place-items-center">
          <Hotel className="size-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-white tracking-tight">
          Arbor<span className="opacity-50 font-light italic">ERP</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
              {section.heading}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                if (user && !hasPermission(user.role, item.perm)) return null;
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent text-white"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-sidebar-accent grid place-items-center text-white text-xs font-semibold">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate capitalize">
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
