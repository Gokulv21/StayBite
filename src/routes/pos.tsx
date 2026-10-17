import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, ShoppingCart, Receipt, ChefHat, Pencil, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useDataStore, CartItem } from "@/stores/data-store";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "POS Terminal — StayBite" },
      { name: "description", content: "Restaurant point-of-sale: dine-in, takeaway, delivery, room service." },
    ],
  }),
  component: PosPage,
});

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Starters", "Mains", "Sides", "Desserts", "Drinks"];
const EDIT_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Starters", "Mains", "Sides", "Desserts", "Drinks"];

function PosPage() {
  const { menuItems, setMenuItems, cart, setCart, kdsTickets, setKdsTickets, rooms, chargeRoom, decrementInventoryForOrder } = useDataStore();
  
  // Custom Item Modal State
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customGst, setCustomGst] = useState("5");
  const [customType, setCustomType] = useState<"Veg" | "Non-Veg">("Veg");
  const [customCategories, setCustomCategories] = useState<string[]>(["Mains"]);
  const [saveCustomToMenu, setSaveCustomToMenu] = useState(true);
  const [selectedSavedDish, setSelectedSavedDish] = useState("");

  // Manage Dish Modal State
  const [manageDishOpen, setManageDishOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState("");
  
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishGst, setDishGst] = useState("0");
  const [dishCategories, setDishCategories] = useState<string[]>(["Mains"]);
  const [dishType, setDishType] = useState<"Veg" | "Non-Veg">("Veg");
  
  // Filter State
  const [activeCategory, setActiveCategory] = useState("All");

  const [targetType, setTargetType] = useState<"Table" | "Room">("Table");
  const [targetId, setTargetId] = useState("T-01");

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((p) => {
        if (p.id === id) {
          const newQty = p.qty + delta;
          return newQty > 0 ? { ...p, qty: newQty } : p;
        }
        return p;
      });
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddCustom = () => {
    if (!customName || !customPrice || isNaN(Number(customPrice))) {
      toast.error("Valid name and price required.");
      return;
    }
    const existingDish = menuItems.find(
      (item) => item.name.toLowerCase() === customName.trim().toLowerCase() && Number(item.price) === Number(customPrice),
    );
    const customId = existingDish?.id ?? `custom_${Date.now()}`;
    addToCart({
      id: customId,
      name: customName,
      price: Number(customPrice),
    });
    if (saveCustomToMenu && !existingDish) {
      setMenuItems([
        ...menuItems,
        {
          id: customId,
          name: customName.trim(),
          price: Number(customPrice),
          gst: Number(customGst) || 0,
          categories: customCategories.length > 0 ? customCategories : ["Mains"],
          type: customType,
          isAvailable: true,
        },
      ]);
    }
    setCustomOpen(false);
    setCustomName("");
    setCustomPrice("");
    setCustomGst("5");
    setCustomType("Veg");
    setCustomCategories(["Mains"]);
    setSaveCustomToMenu(true);
    setSelectedSavedDish("");
    toast.success(saveCustomToMenu ? "Item added and saved for future use." : "Item added to cart!");
  };

  const handleSavedDishSelect = (val: string) => {
    setSelectedSavedDish(val);
    const dish = menuItems.find(m => m.id === val);
    if (dish) {
      setCustomName(dish.name);
      setCustomPrice(dish.price.toString());
      setCustomGst(String(dish.gst ?? 0));
      setCustomCategories(dish.categories && dish.categories.length > 0 ? dish.categories : ["Mains"]);
      setCustomType(dish.type || "Veg");
    }
  };

  const toggleCustomCategory = (cat: string) => {
    setCustomCategories((prev) => (prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]));
  };

  const openAddDish = () => {
    setIsEditing(false);
    setEditingId("");
    setDishName("");
    setDishPrice("");
    setDishGst("0");
    setDishCategories(["Mains"]);
    setDishType("Veg");
    setManageDishOpen(true);
  };

  const openEditDish = (e: React.MouseEvent, dish: any) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingId(dish.id);
    setDishName(dish.name);
    setDishPrice(dish.price.toString());
    setDishGst(dish.gst?.toString() || "0");
    setDishCategories(dish.categories || (dish.category ? [dish.category] : ["Mains"]));
    setDishType(dish.type || "Veg");
    setManageDishOpen(true);
  };

  const toggleCategory = (cat: string) => {
    setDishCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };

  const handleSaveDish = () => {
    if (!dishName || !dishPrice || isNaN(Number(dishPrice))) {
      toast.error("Valid Dish Name and Price are required.");
      return;
    }
    
    if (dishCategories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }
    
    if (isEditing) {
      setMenuItems((prev) => prev.map(m => m.id === editingId ? {
        ...m,
        name: dishName,
        price: Number(dishPrice),
        categories: dishCategories,
        gst: Number(dishGst),
        type: dishType,
      } : m));
      toast.success("Dish updated successfully!");
    } else {
      const newDish = {
        id: `m_${Date.now()}`,
        name: dishName,
        price: Number(dishPrice),
        categories: dishCategories,
        gst: Number(dishGst),
        type: dishType,
      };
      setMenuItems([...menuItems, newDish]);
      toast.success("New dish added to menu!");
    }
    
    setManageDishOpen(false);
  };

  const handleDeleteMenuItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMenuItems((prev) => prev.filter(m => m.id !== id));
    toast.success("Menu item deleted.");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalGst = cart.reduce((sum, item) => sum + (item.price * item.qty * ((item.gst || 0) / 100)), 0);
  const grandTotal = subtotal + totalGst;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!targetId) {
      toast.error("Please specify a Target Table or Room.");
      return;
    }

    const ticketId = `T-${Math.floor(Math.random() * 1000) + 5000}`;
    const itemsList = cart.map(item => `${item.qty}× ${item.name}`);

    // Create KDS ticket
    setKdsTickets([...kdsTickets, {
      id: ticketId,
      table: targetType === "Room" ? `Rm ${targetId}` : targetId,
      items: itemsList,
      elapsed: 0,
      urgent: false,
      status: "pending",
      createdAt: new Date().toISOString(),
    }]);

    // If assigned to a Room, charge the room folio
    if (targetType === "Room") {
      const itemsSummary = itemsList.join(", ");
      chargeRoom(targetId, {
        id: `POS-${Date.now()}`,
        description: `Restaurant Order (${ticketId}): ${itemsSummary}`,
        amount: grandTotal,
        time: new Date().toISOString(),
        status: "completed",
      });
      toast.success(`Order sent to Kitchen and ₹${grandTotal.toFixed(2)} charged to Room ${targetId}!`);
    } else {
      toast.success(`Order placed for ₹${grandTotal.toFixed(2)}! Sending to Kitchen...`);
    }

    // Decrement inventory stock levels automatically if enabled in settings
    decrementInventoryForOrder(cart);

    setCart([]);
  };

  const handleClearCart = () => {
    setCart([]);
    toast.success("Cart cleared.");
  };

  const filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter(m => m.categories?.includes(activeCategory));

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto min-h-full flex flex-col">
      
      {/* Custom Item Modal */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Order Item</DialogTitle>
            <DialogDescription>Select from pre-saved dishes or enter a custom item.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            
            {/* Pre-saved Dish Dropdown */}
            <div className="space-y-2 bg-muted/30 p-4 rounded-lg border">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Quick Select Saved Dish</Label>
              <Select value={selectedSavedDish} onValueChange={handleSavedDishSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Search or select a dish..." />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name} — ₹{m.price}</SelectItem>
                  ))}
                  {menuItems.length === 0 && <SelectItem value="none" disabled>No dishes saved yet.</SelectItem>}
                </SelectContent>
              </Select>
            </div>

              <div className="space-y-4">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Manual Details</Label>
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Special Request Diet" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="0.00" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label>GST %</Label>
                    <Input value={customGst} onChange={(e) => setCustomGst(e.target.value)} placeholder="5" type="number" step="0.01" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {EDIT_CATEGORIES.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        size="sm"
                        variant={customCategories.includes(cat) ? "default" : "outline"}
                        className="h-7 text-xs rounded-full"
                        onClick={() => toggleCustomCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={customType} onValueChange={(value: "Veg" | "Non-Veg") => setCustomType(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Veg">Veg</SelectItem>
                      <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" checked={saveCustomToMenu} onChange={(e) => setSaveCustomToMenu(e.target.checked)} />
                  Save this custom item to POS menu for future use
                </label>
              </div>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustom}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dish Modal */}
      <Dialog open={manageDishOpen} onOpenChange={setManageDishOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Dish" : "Save New Dish to Menu"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modify the details of this dish." : "Add a pre-configured dish to your menu grid and quick-select list."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Dish Name</Label>
                <Input value={dishName} onChange={(e) => setDishName(e.target.value)} placeholder="e.g. Chicken Biryani" />
              </div>
              <div className="space-y-2">
                <Label>Price (incl. GST) ₹</Label>
                <Input value={dishPrice} onChange={(e) => setDishPrice(e.target.value)} placeholder="250" type="number" />
              </div>
              <div className="space-y-2">
                <Label>GST %</Label>
                <Input value={dishGst} onChange={(e) => setDishGst(e.target.value)} placeholder="e.g. 5.5" type="number" step="0.01" />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label>Categories (Multi-Select)</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {EDIT_CATEGORIES.map(cat => (
                    <Button 
                      key={cat}
                      type="button"
                      variant={dishCategories.includes(cat) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(cat)}
                      className={`h-7 px-3 text-xs rounded-full ${dishCategories.includes(cat) ? '' : 'text-muted-foreground border-dashed'}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Type</Label>
                <Select value={dishType} onValueChange={(v: "Veg" | "Non-Veg") => setDishType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Veg">Veg (Green)</SelectItem>
                    <SelectItem value="Non-Veg">Non-Veg (Red)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageDishOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDish}>{isEditing ? "Save Changes" : "Save Dish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="POS Terminal"
        description="Dine-in, takeaway, delivery and room-service ordering."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={openAddDish}>
              <ChefHat className="size-3.5" /> Add Dish
            </Button>
            <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => { setCustomOpen(true); setCustomName(""); setCustomPrice(""); setCustomGst("5"); setCustomType("Veg"); setCustomCategories(["Mains"]); setSaveCustomToMenu(true); setSelectedSavedDish(""); }}>
              <Plus className="size-3.5" /> Custom Item
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 mt-2">
        {/* Left Pane - Menu Grid */}
        <div className="flex-1 flex flex-col min-h-0 pb-4">
          
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 hide-scrollbar border-b border-border">
            {CATEGORIES.map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-full px-4 h-8 text-xs whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === category ? "shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                <Tag className="w-8 h-8 mb-2 opacity-50" />
                <p>No dishes found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="p-3.5 rounded-xl border bg-card hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between h-28 relative group shadow-sm hover:shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.type === 'Non-Veg' ? 'bg-red-500 ring-2 ring-red-500/20' : 'bg-emerald-500 ring-2 ring-emerald-500/20'}`} />
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.categories?.[0] || 'Dish'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => openEditDish(e, item)}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors bg-background rounded shadow-sm border"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteMenuItem(e, item.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors bg-background rounded shadow-sm border"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end gap-2">
                      <div className="font-semibold text-sm leading-tight flex-1 truncate" title={item.name}>{item.name}</div>
                      <div className="text-primary font-mono text-sm font-bold">₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Cart */}
        <div className="w-full lg:w-[400px] flex flex-col bg-card rounded-xl ring-1 ring-border shadow-soft overflow-hidden shrink-0 mt-4 lg:mt-0">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 font-semibold min-w-fit">
              <ShoppingCart className="w-4 h-4" /> Current Order
            </div>
            <div className="flex gap-2 items-center flex-1 justify-end min-w-[200px]">
              <Select value={targetType} onValueChange={(v: "Table"|"Room") => { setTargetType(v); setTargetId(""); }}>
                <SelectTrigger className="h-8 text-xs w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Table">Table</SelectItem>
                  <SelectItem value="Room">Room</SelectItem>
                </SelectContent>
              </Select>
              
              {targetType === "Table" ? (
                <Input className="h-8 text-xs w-20" placeholder="e.g. T-12" value={targetId} onChange={e => setTargetId(e.target.value)} />
              ) : (
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger className="h-8 text-xs w-24"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {rooms.filter(r => r.status === 'occupied').map(r => (
                      <SelectItem key={r.number} value={r.number}>Rm {r.number}</SelectItem>
                    ))}
                    {rooms.filter(r => r.status === 'occupied').length === 0 && (
                      <SelectItem value="none" disabled>No occupied rooms</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={handleClearCart}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Receipt className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="font-medium text-sm truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">₹{item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-muted rounded-md overflow-hidden">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-background"><Minus className="w-3 h-3" /></button>
                        <span className="w-6 text-center text-xs font-medium">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-background"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-border bg-muted/10 space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>GST Total</span>
              <span className="font-mono">₹{totalGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t text-lg font-semibold">
              <span>Grand Total</span>
              <span className="font-mono text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
            <Button className="w-full h-12 text-base mt-2" onClick={handleCheckout} disabled={cart.length === 0}>
              Send to Kitchen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
