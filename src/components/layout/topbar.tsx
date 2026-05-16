import { useEffect } from "react";
import { Bell, Search, Wifi, WifiOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSession } from "@/stores/session-store";

export function Topbar() {
  const { branches, activeBranchId, setActiveBranch, isOnline, setOnline } = useSession();

  useEffect(() => {
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
    <header className="h-14 sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Select value={activeBranchId ?? undefined} onValueChange={setActiveBranch}>
          <SelectTrigger className="h-9 w-[240px] text-xs font-medium">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id} className="text-xs">
                <span className="font-medium">{b.name}</span>
                <span className="text-muted-foreground ml-2">{b.city}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden lg:flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-card w-72">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, rooms, guests..."
            className="bg-transparent text-xs outline-none w-full placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-[10px] font-medium uppercase tracking-wider">
          {isOnline ? (
            <>
              <Wifi className="size-3 text-success" />
              <span className="text-success">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="size-3 text-warning" />
              <span className="text-warning">Offline · Queueing</span>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="size-9">
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  );
}
