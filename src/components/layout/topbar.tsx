import { useEffect } from "react";
import { Bell, Search, Wifi, WifiOff, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/stores/session-store";

export function Topbar({ onSearchClick }: { onSearchClick?: () => void }) {
  const { branches, activeBranchId, isOnline, setOnline } = useSession();
  const activeBranch = branches.find((item) => item.id === activeBranchId);
  const shortcutHint = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac") ? "⌘K" : "Ctrl+K";

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
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-primary/20 grid place-items-center">
          <Hotel className="size-4 text-primary" />
        </div>
        <span className="text-sm font-semibold">StayBite Suite</span>
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <div className="h-9 px-3 rounded-full border border-white/25 bg-white/40 dark:bg-black/20 flex items-center">
          <span className="text-xs text-muted-foreground">
            {activeBranch ? `${activeBranch.name} · ${activeBranch.city}` : "No active branch"}
          </span>
        </div>

        <button onClick={onSearchClick} className="flex items-center gap-3 px-4 h-10 rounded-full border border-white/25 bg-white/40 dark:bg-black/20 w-80 text-left">
          <Search className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search operations, rooms...</span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">{shortcutHint}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/40 dark:bg-black/20 text-[10px] font-medium uppercase tracking-wider">
          {isOnline ? (
            <>
              <Wifi className="size-3 text-success" />
              <span className="text-success">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="size-3 text-warning" />
              <span className="text-warning">Offline</span>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="size-9">
          <Bell className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 px-3 border-white/25 bg-white/50 dark:bg-black/20"
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
