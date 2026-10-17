import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useDataStore, MenuItem, RoomOrder, Ticket } from "@/stores/data-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Utensils, Search, ShoppingBag, Plus, Minus, CheckCircle2, Clock, Hotel, ChefHat, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/guest/room/$roomNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Room ${params.roomNumber} In-Room Dining — StayBite` },
      { name: "description", content: "Order fresh food and beverages directly to your hotel room." },
    ],
  }),
  component: GuestRoomMenuPage,
});

function GuestRoomMenuPage() {
  const { roomNumber } = Route.useParams();
  const { menuItems, rooms, setRooms, kdsTickets, setKdsTickets } = useDataStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);

  const room = rooms.find(r => r.number === roomNumber);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(m => m.category || "General")));
    return ["All", ...cats];
  }, [menuItems]);

  // Filtered menu items
  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchVeg = !vegOnly || item.isVeg;
      const matchQuery = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.category?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
      return matchCat && matchVeg && matchQuery;
    });
  }, [menuItems, selectedCategory, vegOnly, searchQuery]);

  const totalItemsCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const totalCartAmount = cart.reduce((sum, c) => sum + (c.item.price * c.qty), 0);

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === itemId);
      if (!existing) return prev;
      if (existing.qty === 1) {
        return prev.filter(c => c.item.id !== itemId);
      }
      return prev.map(c => c.item.id === itemId ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const handlePlaceRoomOrder = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const ticketId = `T-${Math.floor(Math.random() * 1000) + 7000}`;
    const itemStrings = cart.map(c => `${c.qty}× ${c.item.name}`);
    const summaryText = itemStrings.join(", ");

    // 1. Charge to room folio as completed order
    const newRoomOrder: RoomOrder = {
      id: orderId,
      description: `In-Room QR Order (${ticketId}): ${summaryText}`,
      amount: totalCartAmount,
      time: new Date().toISOString(),
      status: "completed"
    };

    setRooms(rooms.map(r => r.number === roomNumber ? {
      ...r,
      orders: [...(r.orders || []), newRoomOrder]
    } : r));

    // 2. Dispatch ticket to Kitchen KDS
    const newTicket: Ticket = {
      id: ticketId,
      table: `Rm ${roomNumber}`,
      items: itemStrings,
      elapsed: 0,
      urgent: false,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setKdsTickets([...kdsTickets, newTicket]);

    setLastPlacedOrder({
      orderId,
      ticketId,
      items: cart,
      total: totalCartAmount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setCart([]);
    setOrderSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 selection:bg-primary selection:text-primary-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
              <Hotel className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">StayBite Residency</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono font-bold">Room {roomNumber}</span>
              </div>
              <h1 className="text-sm font-semibold text-foreground">Contactless In-Room Dining</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1 py-1">
              <Sparkles className="size-3" /> Kitchen Live
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* Welcome Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-foreground">Welcome{room?.guestName ? `, ${room.guestName}` : ""}!</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Order chef-crafted specialties right to Room {roomNumber}. Charges will be added to your checkout folio.</p>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-primary">
            <Clock className="size-3.5" /> Avg delivery: 20-25 mins
          </div>
        </div>

        {/* Search & Veg Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search dishes, drinks, desserts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-card border-border/80 text-xs"
            />
          </div>
          <Button
            variant={vegOnly ? "default" : "outline"}
            size="sm"
            className={`h-10 rounded-xl px-3 text-xs gap-1.5 ${vegOnly ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
            onClick={() => setVegOnly(!vegOnly)}
          >
            <span className={`size-2 rounded-full ${vegOnly ? "bg-white" : "bg-emerald-500"}`} />
            Veg Only
          </Button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              size="sm"
              className="h-8 rounded-full text-xs px-3.5 shrink-0"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {filteredMenu.map((item) => {
            const inCart = cart.find(c => c.item.id === item.id);

            return (
              <div 
                key={item.id}
                className="p-3.5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-2.5 rounded-xs border flex items-center justify-center p-0.5 ${item.isVeg ? "border-emerald-500 text-emerald-500" : "border-rose-500 text-rose-500"}`}>
                        <span className={`size-1 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                      </span>
                      <h3 className="text-sm font-bold text-foreground leading-tight">{item.name}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary shrink-0">₹{item.price.toFixed(2)}</span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description || `Freshly prepared ${item.name.toLowerCase()} with signature herbs & ingredients.`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{item.category}</span>
                  
                  {inCart ? (
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg p-0.5">
                      <Button size="icon" variant="ghost" className="size-6 rounded-md" onClick={() => handleRemoveFromCart(item.id)}>
                        <Minus className="size-3 text-primary" />
                      </Button>
                      <span className="text-xs font-mono font-bold text-primary px-1">{inCart.qty}</span>
                      <Button size="icon" variant="ghost" className="size-6 rounded-md" onClick={() => handleAddToCart(item)}>
                        <Plus className="size-3 text-primary" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs rounded-lg px-2.5 gap-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus className="size-3" /> Add
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredMenu.length === 0 && (
          <div className="py-12 text-center text-muted-foreground space-y-2 border border-dashed rounded-2xl">
            <Utensils className="size-10 mx-auto opacity-30" />
            <p className="text-sm font-semibold">No dishes match your filter</p>
            <p className="text-xs">Try searching for other items or resetting filters.</p>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
          <div className="max-w-3xl mx-auto p-3.5 rounded-2xl bg-zinc-900 text-white shadow-2xl border border-zinc-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold font-mono">
                {totalItemsCount}
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">{totalItemsCount} item(s) selected</span>
                <span className="text-base font-bold font-mono text-emerald-400">₹{totalCartAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-4 rounded-xl gap-2 shadow-lg"
              onClick={handlePlaceRoomOrder}
            >
              <ShoppingBag className="size-4" /> Order to Room {roomNumber}
            </Button>
          </div>
        </div>
      )}

      {/* Order Success Dialog */}
      <Dialog open={orderSuccessOpen} onOpenChange={setOrderSuccessOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 text-center">
          <div className="size-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
            <CheckCircle2 className="size-8" />
          </div>
          <DialogTitle className="text-xl font-bold">Order Received!</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ticket <span className="font-mono font-bold text-foreground">{lastPlacedOrder?.ticketId}</span> has been dispatched to the kitchen.
          </DialogDescription>

          <div className="my-4 p-4 rounded-xl bg-muted/40 border text-left space-y-2">
            <div className="flex justify-between items-center text-xs pb-2 border-b">
              <span className="text-muted-foreground">Delivering to:</span>
              <span className="font-bold font-mono text-primary">Room {roomNumber}</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
              {lastPlacedOrder?.items.map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs text-foreground">
                  <span>{i.qty}× {i.item.name}</span>
                  <span className="font-mono text-muted-foreground">₹{(i.item.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t font-bold text-xs">
              <span>Charged to Room Folio</span>
              <span className="font-mono text-primary">₹{lastPlacedOrder?.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-primary/10 rounded-xl flex items-center gap-2.5 text-xs text-primary text-left">
            <ChefHat className="size-5 shrink-0" />
            <p>Our chef is preparing your meal fresh. Relax while we deliver it to your room!</p>
          </div>

          <DialogFooter className="mt-4">
            <Button className="w-full" onClick={() => setOrderSuccessOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
