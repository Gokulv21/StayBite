import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BedDouble,
  ShoppingCart,
  ChefHat,
  Menu,
} from "lucide-react";
import { useSession } from "@/stores/session-store";
import { cn } from "@/lib/utils";
import { MobileDrawer } from "./mobile-drawer";

export function MobileBottomBar() {
  const user = useSession((s) => s.user);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/rooms", label: "Rooms", icon: BedDouble },
    { to: "/pos", label: "POS", icon: ShoppingCart },
    { to: "/kds", label: "Kitchen", icon: ChefHat },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-2xl border-t border-border/70 pb-[env(safe-area-inset-bottom,0px)] shadow-2xl">
      <div className="flex items-center justify-around px-2 py-1.5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative",
                active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-xl transition-all",
                  active && "bg-primary/15 text-primary scale-110 shadow-sm"
                )}
              >
                <Icon className="size-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              {active && (
                <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* 5th Tab: More Drawer */}
        <MobileDrawer
          trigger={
            <button
              type="button"
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="p-1 rounded-xl transition-all">
                <Menu className="size-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">More</span>
            </button>
          }
        />
      </div>
    </div>
  );
}
