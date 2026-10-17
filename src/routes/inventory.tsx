import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Minus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataStore } from "@/stores/data-store";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory — StayBite" }] }),
  component: InventoryPage,
});

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

function InventoryPage() {
  const { inventory, setInventory, settings } = useDataStore();
  const inStockCount = inventory.filter((item) => item.status === "In Stock").length;
  const lowStockCount = inventory.filter((item) => item.status === "Low Stock").length;
  const outOfStockCount = inventory.filter((item) => item.status === "Out of Stock").length;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const handleAdjustQty = (id: string, delta: number) => {
    const threshold = settings?.lowStockThreshold ?? 5;
    const updated = inventory.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
        if (newQty === 0) status = "Out of Stock";
        else if (newQty <= threshold) status = "Low Stock";
        return { ...item, quantity: Number(newQty.toFixed(2)), status };
      }
      return item;
    });
    setInventory(updated);
    toast.success("Stock level updated!");
  };

  const handleAdd = () => {
    if (!name || !category || !quantity || !unit) {
      toast.error("Please fill all details.");
      return;
    }
    const qtyNum = Number(quantity);
    let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (qtyNum === 0) status = "Out of Stock";
    else if (qtyNum <= 5) status = "Low Stock";

    const newItem: InventoryItem = {
      id: `INV-${Date.now().toString(36).toUpperCase()}`,
      name,
      category,
      quantity: qtyNum,
      unit,
      status,
    };
    setInventory([...inventory, newItem]);
    setOpen(false);
    setName("");
    setCategory("");
    setQuantity("");
    setUnit("");
    toast.success("Inventory item added successfully!");
  };

  const handleDelete = (id: string) => {
    setInventory(inventory.filter(i => i.id !== id));
    toast.success("Inventory item deleted.");
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tomatoes" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food & Ingredients</SelectItem>
                  <SelectItem value="Beverage">Beverage</SelectItem>
                  <SelectItem value="Supplies">Hotel Supplies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, boxes, liters" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Inventory"
        description="Stock levels, raw materials & supply availability."
        actions={
          <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => setOpen(true)}>
            <Plus className="size-3.5" /> Add Item
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-card rounded-xl ring-1 ring-border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">In Stock</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">{inStockCount}</p>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Low Stock</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">{lowStockCount}</p>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-border p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Out of Stock</p>
          <p className="text-xl sm:text-2xl font-bold text-rose-600">{outOfStockCount}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft overflow-hidden">
        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-border">
          {inventory.map((item) => (
            <div key={item.id} className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold leading-tight">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · <span className="font-mono">{item.id}</span></p>
                </div>
                <Badge variant={item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "secondary" : "destructive"} className="shrink-0 text-[10px]">
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleAdjustQty(item.id, -1)}>
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-sm font-mono font-bold w-10 text-center">{item.quantity}</span>
                  <span className="text-xs text-muted-foreground">{item.unit}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleAdjustQty(item.id, 1)}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {inventory.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No inventory items. Tap "Add Item" to start.</div>
          )}
        </div>
        {/* Desktop table */}
        <table className="hidden sm:table w-full text-left">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">ID</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Item Name</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Category</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-right">Quantity</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Status</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{item.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{item.category}</td>
                <td className="px-6 py-4 text-sm font-mono text-right font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full transition-transform active:scale-95 border-border hover:bg-muted" onClick={() => handleAdjustQty(item.id, -1)}>
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <span className="text-muted-foreground text-xs font-sans w-8 text-left">{item.unit}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full transition-transform active:scale-95 border-border hover:bg-muted" onClick={() => handleAdjustQty(item.id, 1)}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "secondary" : "destructive"}>
                    {item.status === "Low Stock" || item.status === "Out of Stock" ? <AlertTriangle className="w-3 h-3 mr-1 inline" /> : null}
                    {item.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No inventory items found. Click "Add Item" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
