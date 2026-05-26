import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDataStore } from "@/stores/data-store";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingBag, UtensilsCrossed, Hotel, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/menu")({
  component: PublicMenuPage,
});

function PublicMenuPage() {
  const { menuItems, kdsTickets, setKdsTickets, tables, rooms } = useDataStore();
  const [cart, setCart] = useState<{ id: string; name: string; qty: number; price: number }[]>([]);

  // Setup Flow States
  const [step, setStep] = useState<"select-type" | "enter-number" | "menu">("select-type");
  const [diningType, setDiningType] = useState<"Table" | "Room" | null>(null);
  const [numberInput, setNumberInput] = useState("");
  const [identifier, setIdentifier] = useState(""); // e.g. "Table 14" or "Room 102"

  const handleSelectType = (type: "Table" | "Room") => {
    setDiningType(type);
    setStep("enter-number");
  };

  const handleConfirmNumber = () => {
    if (!numberInput) return toast.error(`Please enter a valid ${diningType} number.`);
    
    // Validate if it exists
    if (diningType === "Table") {
      const exists = tables.find(t => t.id === `T-${numberInput}` || t.id.replace("T-","") === numberInput);
      if (!exists) return toast.error(`Table ${numberInput} does not exist.`);
      setIdentifier(exists.id);
    } else {
      const exists = rooms.find(r => r.number === numberInput);
      if (!exists) return toast.error(`Room ${numberInput} does not exist.`);
      if (exists.status !== "occupied") return toast.error(`Room ${numberInput} is currently not occupied.`);
      setIdentifier(`Room ${exists.number}`);
    }

    setStep("menu");
  };

  const handleAdd = (item: any) => {
    if (item.isAvailable === false) return; // Guard
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id: item.id, name: item.name, qty: 1, price: item.price }];
    });
  };

  const handleRemove = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing && existing.qty > 1) {
        return prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c));
      }
      return prev.filter((c) => c.id !== id);
    });
  };

  const submitOrder = () => {
    if (cart.length === 0) return;
    
    const newTicket = {
      id: `KOT-${Math.floor(1000 + Math.random() * 9000)}`,
      table: identifier,
      items: cart.map(c => `${c.qty}x ${c.name}`),
      elapsed: 0,
      urgent: false,
      status: "pending" as const,
      createdAt: new Date().toISOString()
    };
    
    setKdsTickets([...kdsTickets, newTicket]);
    setCart([]);
    toast.success("Order sent to kitchen! It will be added to your bill.", { duration: 5000 });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Fallback demo items if store is empty
  const displayItems = menuItems.length > 0 ? menuItems : [
    { id: "M1", name: "Margherita Pizza", price: 450, type: "Veg", isAvailable: true },
    { id: "M2", name: "Chicken Tikka Masala", price: 550, type: "Non-Veg", isAvailable: true },
    { id: "M3", name: "Truffle Fries", price: 300, type: "Veg", isAvailable: false },
    { id: "M4", name: "Fresh Lime Soda", price: 120, type: "Veg", isAvailable: true },
  ];

  if (step === "select-type") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-center mb-10">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <UtensilsCrossed className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome to StayBite</h1>
          <p className="text-zinc-500 mt-2">Where are you ordering from today?</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <button 
            onClick={() => handleSelectType("Table")}
            className="flex flex-col items-center gap-3 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm transition-all active:scale-95 hover:border-primary hover:ring-1 hover:ring-primary"
          >
            <UtensilsCrossed className="w-8 h-8 text-zinc-700" />
            <span className="font-semibold text-zinc-900">Restaurant Table</span>
          </button>
          <button 
            onClick={() => handleSelectType("Room")}
            className="flex flex-col items-center gap-3 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm transition-all active:scale-95 hover:border-primary hover:ring-1 hover:ring-primary"
          >
            <Hotel className="w-8 h-8 text-zinc-700" />
            <span className="font-semibold text-zinc-900">Hotel Room</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === "enter-number") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Enter Number</h2>
            <p className="text-sm text-zinc-500">Please enter your {diningType} number to continue.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{diningType} Number</Label>
            <Input 
              autoFocus
              className="h-12 text-center text-xl tracking-widest font-bold"
              placeholder={diningType === "Table" ? "e.g. 14" : "e.g. 102"}
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
            />
          </div>
          <Button className="w-full h-12 text-base font-bold shadow-md" onClick={handleConfirmNumber}>
            View Menu <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="ghost" className="w-full text-zinc-500" onClick={() => setStep("select-type")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: MENU
  return (
    <div className="min-h-screen bg-zinc-50 pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-zinc-100 shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 grid place-items-center">
            <UtensilsCrossed className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">StayBite Restaurant</h1>
            <p className="text-sm font-bold text-primary">{identifier}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setStep("select-type")}>Change</Button>
      </div>

      {/* Menu Grid */}
      <div className="p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          Our Menu
        </h2>
        <div className="space-y-4">
          {displayItems.map((item) => {
            const available = item.isAvailable !== false; // defaults to true
            const cartItem = cart.find((c) => c.id === item.id);
            return (
              <div key={item.id} className={`bg-white p-4 rounded-xl border flex items-center justify-between transition-opacity ${available ? "border-zinc-200 shadow-sm" : "border-zinc-100 opacity-60 bg-zinc-50/50"}`}>
                <div>
                  <h3 className={`font-bold ${available ? "text-zinc-900" : "text-zinc-400 line-through"}`}>{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-semibold ${available ? "text-zinc-600" : "text-zinc-400"}`}>₹{item.price}</span>
                    {!available && <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-sm uppercase tracking-widest">Sold Out</span>}
                  </div>
                </div>
                <div>
                  {available ? (
                    cartItem ? (
                      <div className="flex items-center gap-3 bg-zinc-50 rounded-lg p-1 border border-zinc-200 shadow-inner">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white shadow-sm" onClick={() => handleRemove(item.id)}>
                          <Minus className="size-4" />
                        </Button>
                        <span className="font-bold text-sm w-4 text-center">{cartItem.qty}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white shadow-sm" onClick={() => handleAdd(item)}>
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="rounded-full px-5 font-bold shadow-sm" onClick={() => handleAdd(item)}>
                        Add
                      </Button>
                    )
                  ) : (
                    <Button variant="ghost" size="sm" disabled className="rounded-full px-4 font-semibold opacity-50 bg-zinc-100">
                      Unavailable
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Bottom Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 animate-slide-up">
          <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl flex justify-between px-6" onClick={submitOrder}>
            <div className="flex items-center">
              <ShoppingBag className="mr-2 size-5" />
              Place Order
            </div>
            <span>₹{total.toFixed(2)}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
