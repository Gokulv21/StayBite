import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  LayoutDashboard,
  BedDouble,
  ShoppingCart,
  ChefHat,
  Package,
  Users,
  UserCog,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Hotel,
  Sun,
  Moon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSession } from "@/stores/session-store";
import { useDataStore } from "@/stores/data-store";
import { hasPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export function MobileDrawer({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const user = useSession((s) => s.user);
  const logout = useSession((s) => s.logout);
  const settings = useDataStore((s) => s.settings);
  const updateSettings = useDataStore((s) => s.updateSettings);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isDark = settings?.themeMode === "dark";

  const toggleTheme = () => {
    updateSettings({ themeMode: isDark ? "light" : "dark" });
  };

  const navGroups = [
    {
      title: "Front Desk & Lodging",
      items: [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard.view" },
        { to: "/rooms", label: "Rooms & Check-In", icon: BedDouble, perm: "rooms.view" },
      ],
    },
    {
      title: "Dining & Kitchen",
      items: [
        { to: "/pos", label: "Restaurant POS", icon: ShoppingCart, perm: "pos.use" },
        { to: "/kds", label: "Kitchen Display (KDS)", icon: ChefHat, perm: "kds.view" },
      ],
    },
    {
      title: "Operations & CRM",
      items: [
        { to: "/inventory", label: "Inventory Stock", icon: Package, perm: "inventory.view" },
        { to: "/customers", label: "Guest Directory (CRM)", icon: Users, perm: "customers.view" },
        { to: "/staff", label: "Staff & Shifts", icon: UserCog, perm: "staff.view" },
      ],
    },
    {
      title: "Finance & Insights",
      items: [
        { to: "/accounting", label: "Accounting & GST", icon: Wallet, perm: "accounting.view" },
        { to: "/reports", label: "Reports & Analytics", icon: BarChart3, perm: "reports.view" },
        { to: "/settings", label: "Hotel Settings", icon: Settings, perm: "settings.view" },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-xl border-border bg-card/80 backdrop-blur-md cursor-pointer hover:bg-primary/10 shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="size-5 text-foreground" />
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col bg-card/95 backdrop-blur-2xl border-r border-border text-foreground">
        {/* Drawer Header */}
        <SheetHeader className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/icons/staybite-light-48.png"
                alt="StayBite"
                className="size-9 rounded-xl object-cover shadow-md border border-amber-500/30"
              />
              <div className="flex flex-col text-left">
                <SheetTitle className="text-base font-extrabold tracking-tight leading-none text-foreground">
                  StayBite
                </SheetTitle>
                <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase mt-0.5">
                  by Zevox
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg cursor-pointer"
              onClick={toggleTheme}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-primary" />}
            </Button>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="mt-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight truncate max-w-[130px]">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Active
              </span>
            </div>
          )}
        </SheetHeader>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              user ? hasPermission(user.role, item.perm as any) : true
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1">
                  {group.title}
                </p>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active ? "text-primary-foreground" : "text-primary")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Drawer Footer / Sign Out */}
        <div className="p-3 border-t border-border/60 bg-muted/10 space-y-2">
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2 text-xs font-semibold rounded-xl h-9"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <LogOut className="size-3.5" /> Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
