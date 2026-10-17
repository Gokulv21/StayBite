import { useEffect, useState, useMemo, useRef } from "react";
import { Bell, Search, Wifi, WifiOff, AlertTriangle, Clock, ChefHat, Package, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/stores/session-store";
import { useDataStore } from "@/stores/data-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
export function Topbar({ onSearchClick }: { onSearchClick?: () => void }) {
  const { isOnline, setOnline } = useSession();
  const { rooms, kdsTickets, inventory } = useDataStore();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  // Guard: only show the overdue toast ONCE per session mount
  const overdueToastFiredRef = useRef(false);
  const shortcutHint = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac") ? "⌘K" : "Ctrl+K";

  // Check for Overdue Room Checkouts
  const overdueRooms = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return rooms.filter(r =>
      r.status === "occupied" &&
      r.checkoutDate &&
      r.checkoutDate < today
    );
  }, [rooms]);

  // Urgent KDS Tickets
  const urgentTickets = useMemo(() => {
    return kdsTickets.filter(t => t.status === "pending" && t.urgent);
  }, [kdsTickets]);

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return inventory.filter(i => i.quantity <= 5);
  }, [inventory]);

  const totalNotifications = overdueRooms.length + urgentTickets.length + (lowStockItems.length > 0 ? 1 : 0);

  useEffect(() => {
    if (overdueRooms.length > 0 && !overdueToastFiredRef.current) {
      overdueToastFiredRef.current = true;
      toast.warning(`⚠️ ${overdueRooms.length} room(s) past checkout date!`, { duration: 8000 });
    }
    if (overdueRooms.length === 0) {
      overdueToastFiredRef.current = false;
    }
    const interval = setInterval(() => {
      if (overdueRooms.length > 0) {
        toast.error(`🔔 OVERDUE CHECKOUT REMINDER`, {
          description: `${overdueRooms.length} guest(s) still occupying rooms past their checkout date!`,
          duration: 10000,
        });
      }
    }, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [overdueRooms.length]);

  useEffect(() => {
    setOnline(window.navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [setOnline]);

  return (
    <header className="floating-topbar">
      {/* Left: Logo only (hamburger is in mobile bottom bar's More tab) */}
      <div className="flex items-center gap-2">
        <img
          src="/icons/staybite-light-48.png"
          alt="StayBite Logo"
          className="size-8 rounded-lg object-cover shadow-sm border border-amber-500/30 shrink-0"
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight leading-none text-foreground">StayBite</span>
          <span className="text-[9px] font-semibold text-amber-500 tracking-wider uppercase">by Zevox</span>
        </div>
      </div>

      {/* Center: Search (desktop only) */}
      <div className="hidden lg:flex items-center gap-3">
        <button onClick={onSearchClick} className="flex items-center gap-3 px-4 h-10 rounded-full border border-white/25 bg-white/40 dark:bg-black/20 w-80 text-left cursor-pointer hover:border-primary/40 transition-colors">
          <Search className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search operations, rooms...</span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">{shortcutHint}</span>
        </button>
      </div>

      {/* Right: Online status (desktop only) + Notification + Sign Out (desktop only) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Online/Offline: hide label on xs */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-white/40 dark:bg-black/20 text-[10px] font-medium uppercase tracking-wider">
          {isOnline ? (
            <>
              <Wifi className="size-3 text-success" />
              <span className="hidden sm:inline text-success">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="size-3 text-warning" />
              <span className="hidden sm:inline text-warning">Offline</span>
            </>
          )}
        </div>

        {/* Live Notification Center */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9 relative cursor-pointer">
              <Bell className="size-4" />
              {totalNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {totalNotifications}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 p-0 shadow-2xl rounded-2xl border bg-card text-foreground" align="end">
            <div className="p-3.5 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Notifications</h4>
              </div>
              <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {totalNotifications} Alert(s)
              </span>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 p-1">
              {overdueRooms.map(room => (
                <div key={room.number} className="p-3 hover:bg-muted/40 transition-colors rounded-xl space-y-1.5 bg-rose-500/5 dark:bg-rose-500/10 mb-1 border border-rose-500/20">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <Clock className="size-3.5" /> Overdue: Room {room.number}
                    </span>
                    <span className="text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-600 dark:text-rose-300 px-1.5 py-0.5 rounded">Overstayed</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>{room.guestName}</strong> — checkout was <span className="font-mono font-semibold text-rose-500">{room.checkoutDate}</span>
                  </p>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="h-6 text-[10px] gap-1 px-2 bg-rose-600 hover:bg-rose-700 text-white"
                      onClick={() => { setPopoverOpen(false); navigate({ to: "/rooms" }); }}
                    >
                      View & Settle <ArrowRight className="size-2.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {urgentTickets.map(ticket => (
                <div key={ticket.id} className="p-3 hover:bg-muted/40 transition-colors rounded-xl space-y-1 bg-warning/5 border border-warning/20 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-warning">
                    <ChefHat className="size-3.5" /> Kitchen Delay ({ticket.table})
                  </div>
                  <p className="text-xs text-muted-foreground">Ticket {ticket.id} waiting {ticket.elapsed}m.</p>
                </div>
              ))}

              {lowStockItems.length > 0 && (
                <div className="p-3 hover:bg-muted/40 transition-colors rounded-xl space-y-1 bg-muted/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Package className="size-3.5 text-primary" /> Low Inventory
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lowStockItems.slice(0, 3).map(i => `${i.name} (${i.quantity} ${i.unit})`).join(", ")}
                  </p>
                </div>
              )}

              {totalNotifications === 0 && (
                <div className="py-8 text-center text-muted-foreground space-y-1">
                  <CheckCircle2 className="size-8 mx-auto text-emerald-500 opacity-40 mb-1" />
                  <p className="text-xs font-semibold">All operations running smoothly!</p>
                  <p className="text-[11px]">No overdue checkouts or urgent warnings.</p>
                </div>
              )}
            </div>

            <div className="p-2 border-t bg-muted/20 text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs h-7 text-muted-foreground hover:text-foreground" onClick={() => setPopoverOpen(false)}>
                Dismiss All
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sign Out: desktop only — mobile uses drawer */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex text-xs h-8 px-3 border-white/25 bg-white/50 dark:bg-black/20"
          onClick={() => {
            const { logout } = useSession.getState();
            logout();
          }}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
