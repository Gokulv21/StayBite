import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, History, ChefHat, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useDataStore, Ticket } from "@/stores/data-store";

function playKitchenChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6 note
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    // AudioContext blocked before interaction
  }
}

export const Route = createFileRoute("/kds")({
  head: () => ({
    meta: [
      { title: "Kitchen Display — StayBite" },
      { name: "description", content: "Live kitchen order screen with realtime updates." },
    ],
  }),
  component: KdsPage,
});

function KdsPage() {
  const { kdsTickets, setKdsTickets, rooms, setRooms, tables, chargeTable, menuItems } = useDataStore();
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [view, setView] = useState<"active" | "history">("active");

  const [timeTick, setTimeTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 10000); // re-render every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getElapsedMinutes = (ticket: Ticket) => {
    if (!ticket.createdAt) return ticket.elapsed || 0;
    const diffMs = Date.now() - new Date(ticket.createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const handleAddTicket = () => {
    if (!table || !itemsText) {
      toast.error("Table and items are required.");
      return;
    }
    const newItems = itemsText.split("\n").filter(i => i.trim());
    if (newItems.length === 0) {
      toast.error("Please enter at least one item.");
      return;
    }
    const newTicket: Ticket = {
      id: `T-${Math.floor(Math.random() * 1000) + 5000}`,
      table,
      items: newItems,
      elapsed: 0,
      urgent: false,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setKdsTickets([...kdsTickets, newTicket]);
    playKitchenChime();
    setOpen(false);
    setTable("");
    setItemsText("");
    toast.success("Manual ticket sent to Kitchen!");
  };

  const markDone = (id: string) => {
    setKdsTickets(kdsTickets.map(t => t.id === id ? { ...t, status: "completed" } : t));
    
    const ticket = kdsTickets.find(t => t.id === id);
    if (!ticket) return;

    // Calculate total cost of ticket items
    let ticketCost = 0;
    ticket.items.forEach(itemString => {
      // itemString format: "2x Margherita Pizza" or "2× Margherita Pizza"
      const match = itemString.match(/^(\d+)[x×]\s+(.*)$/i);
      if (match) {
        const qty = parseInt(match[1]);
        const name = match[2].trim();
        const menuItem = menuItems.find(m => m.name.toLowerCase() === name.toLowerCase());
        if (menuItem) {
          ticketCost += (menuItem.price * qty);
        }
      }
    });

    if (ticket.table.startsWith("Rm ")) {
      const roomNumber = ticket.table.replace("Rm ", "").trim();
      const currentRoom = rooms.find(r => r.number === roomNumber);
      
      const alreadyCharged = currentRoom?.orders?.some(o => o.description.includes(ticket.id));

      if (!alreadyCharged) {
        // If not already charged (e.g. manual KDS ticket), add as completed order to room folio
        const newOrder = {
          id: `ORD-${Date.now()}`,
          description: `Kitchen Order (${ticket.id}): ${ticket.items.join(", ")}`,
          amount: ticketCost,
          time: new Date().toISOString(),
          status: "completed" as const
        };
        setRooms(rooms.map(r => r.number === roomNumber ? {
          ...r,
          orders: [...(r.orders || []), newOrder]
        } : r));
      } else {
        // Ensure any matching order is marked completed
        setRooms(rooms.map(r => r.number === roomNumber ? {
          ...r,
          orders: (r.orders || []).map(o => o.description.includes(ticket.id) ? { ...o, status: "completed" as const } : o)
        } : r));
      }
    } else if (ticket.table.startsWith("T-")) {
      // Charge Table
      chargeTable(ticket.table, ticketCost);
    }
    
    toast.success(`Ticket ${id} marked as completed!`);
  };

  const deleteTicket = (id: string) => {
    setKdsTickets(kdsTickets.filter(t => t.id !== id));
    toast.success(`Ticket ${id} deleted permanently.`);
  };

  const displayedTickets = kdsTickets.filter(t => 
    view === "active" ? t.status === "pending" : t.status === "completed"
  );

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Table / Room</Label>
              <Input value={table} onChange={(e) => setTable(e.target.value)} placeholder="e.g. T-12 or Rm 101" />
            </div>
            <div className="space-y-2">
              <Label>Items (One per line)</Label>
              <Textarea 
                value={itemsText} 
                onChange={(e) => setItemsText(e.target.value)} 
                placeholder="1x Burger&#10;2x Fries" 
                className="h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTicket}>Send Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader 
        title="Kitchen Display" 
        description="Live order queue · auto-refresh" 
        actions={
          <div className="flex gap-3">
            <div className="bg-muted/50 p-1 rounded-lg flex items-center border border-border">
              <Button 
                variant={view === "active" ? "secondary" : "ghost"} 
                size="sm" 
                className="h-8 gap-1.5 shadow-none"
                onClick={() => setView("active")}
              >
                <ChefHat className="w-3.5 h-3.5" /> Active Queue
              </Button>
              <Button 
                variant={view === "history" ? "secondary" : "ghost"} 
                size="sm" 
                className="h-8 gap-1.5 shadow-none"
                onClick={() => setView("history")}
              >
                <History className="w-3.5 h-3.5" /> History
              </Button>
            </div>
            <Button size="sm" className="gap-1.5 h-10" onClick={() => setOpen(true)}>
              <Plus className="size-3.5" /> Manual Ticket
            </Button>
          </div>
        }
      />
      
      {displayedTickets.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-card/50">
          <ChefHat className="w-12 h-12 mb-3 opacity-20" />
          <p>{view === "active" ? "No pending tickets. The kitchen is clear!" : "No completed tickets in history."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {displayedTickets.map((t) => {
            const elapsed = getElapsedMinutes(t);
            const isUrgent = elapsed >= 20 || t.urgent;
            const isAttention = elapsed >= 10 && elapsed < 20;

            return (
              <div
                key={t.id}
                className={`rounded-xl ring-1 shadow-soft overflow-hidden flex flex-col transition-all ${
                  t.status === "completed" 
                    ? "bg-muted/30 ring-border opacity-70 grayscale-[30%]"
                    : isUrgent 
                      ? "bg-rose-500/10 ring-rose-500/50 shadow-md border-t-2 border-t-rose-500" 
                      : isAttention
                        ? "bg-amber-500/10 ring-amber-500/40 border-t-2 border-t-amber-500"
                        : "bg-card ring-border border-t-2 border-t-emerald-500"
                }`}
              >
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="font-mono text-xs font-bold">{t.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      t.status === "completed" 
                        ? "bg-muted text-muted-foreground" 
                        : isUrgent 
                          ? "bg-rose-500 text-white animate-pulse" 
                          : isAttention 
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-300" 
                            : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                    }`}>
                      {t.status === "completed" ? "Done" : `${elapsed}m`}
                    </span>
                    <span className="text-[11px] font-bold text-foreground">· {t.table}</span>
                  </div>
                </div>
                <div className="p-4 space-y-1.5 flex-1">
                  {t.items.map((i, idx) => (
                    <p key={idx} className={`text-sm font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{i}</p>
                  ))}
                </div>
                {t.status === "pending" ? (
                  <div className="p-3 bg-muted/30 border-t border-border flex justify-end">
                    <Button size="sm" variant="secondary" className="gap-1.5 w-full bg-background" onClick={() => markDone(t.id)}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Mark Done
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/30 border-t border-border flex justify-end">
                    <Button size="sm" variant="destructive" className="gap-1.5 w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTicket(t.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
