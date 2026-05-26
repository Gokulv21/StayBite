import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/stores/session-store";
import { useDataStore } from "@/stores/data-store";
import { ROLE_LABELS, hasPermission } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sun, Moon, Download, RotateCcw, Building, Sliders,
  Palette, ShieldAlert, Percent, Check, Lock, Hotel, Plus, LayoutGrid
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — StayBite" }] }),
  component: SettingsPage,
});

type TabId = "general" | "environment" | "operations" | "appearance" | "backup";

function SettingsPage() {
  const { user, branches, activeBranchId, addBranch } = useSession();
  const { settings, updateSettings, tables, setTables, rooms, clearTable, transactions, setTransactions } = useDataStore();
  const branch = branches.find((b) => b.id === activeBranchId);
  
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [newBranchCity, setNewBranchCity] = useState("");
  
  // Environment Setup States
  const [tableCountInput, setTableCountInput] = useState(tables.length.toString());
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const canManageBranches = user && hasPermission(user.role, "branches.manage");

  const currentSettings = settings || {
    hotelName: "StayBite Residency",
    gstin: "33AAAAA1111A1Z1",
    taxRate: 18,
    autoDecrementInventory: true,
    lowStockThreshold: 5,
    themeMode: "dark",
    themePalette: "indigo"
  };

  const handleAddBranch = () => {
    if (!newBranchName || !newBranchCity || !newBranchCode) {
      toast.error("Please fill in all branch fields.");
      return;
    }
    if (branches.some(b => b.id.toLowerCase() === newBranchCode.toLowerCase())) {
      toast.error("A branch with this code already exists.");
      return;
    }
    addBranch({ id: newBranchCode, name: newBranchName, city: newBranchCity });
    setNewBranchName(""); setNewBranchCode(""); setNewBranchCity("");
    toast.success(`New branch '${newBranchName}' added!`);
  };

  const handleExportExcel = () => {
    const storeData = localStorage.getItem("staybite_data");
    if (!storeData) return toast.error("No database state found.");
    const parsed = JSON.parse(storeData);
    const lines = [
      "Module,Records",
      `Rooms,${parsed.state?.rooms?.length ?? 0}`,
      `Inventory,${parsed.state?.inventory?.length ?? 0}`,
      `Staff,${parsed.state?.staffList?.length ?? 0}`,
      `Customers,${parsed.state?.customers?.length ?? 0}`,
      `Transactions,${parsed.state?.transactions?.length ?? 0}`,
      `Invoices,${parsed.state?.invoices?.length ?? 0}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `staybite-backup-summary-${new Date().toISOString().split("T")[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Backup summary exported in Excel format.");
  };

  const handleExportPDF = () => {
    window.print();
    toast.success("Use Print dialog to save as PDF.");
  };

  const handleReset = () => {
    if (window.confirm("WARNING: Are you sure you want to reset the database? All data will be deleted!")) {
      localStorage.removeItem("staybite_data");
      toast.success("Database wiped successfully! Reloading...");
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleUpdateTables = () => {
    const count = parseInt(tableCountInput);
    if (isNaN(count) || count < 1 || count > 100) {
      toast.error("Please enter a valid table count (1-100).");
      return;
    }
    
    // We only create new tables, preserve existing if possible, or wipe all if they want a fresh reset.
    // For simplicity, let's just generate the list, preserving status of existing ones by ID.
    const newTables = Array.from({ length: count }).map((_, i) => {
      const id = `T-${i + 1}`;
      const existing = tables.find(t => t.id === id);
      if (existing) return existing;
      return { id, status: "available" as const, billAmount: 0 };
    });
    setTables(newTables);
    toast.success(`Restaurant environment updated to ${count} tables.`);
  };

  const handleTablePaid = () => {
    if (!selectedTable) return;
    const table = tables.find(t => t.id === selectedTable);
    if (!table) return;

    if (table.billAmount > 0) {
      const newTx = {
        id: `TRX-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split("T")[0],
        description: `Restaurant Bill - ${table.id}`,
        type: "Income" as const,
        amount: table.billAmount,
        method: "Cash",
      };
      setTransactions([newTx, ...transactions]);
    }
    
    clearTable(table.id);
    setSelectedTable(null);
    toast.success(`${table.id} has been marked as Paid and cleared.`);
  };

  const palettes = [
    { id: "indigo", name: "Modern Indigo", color: "bg-indigo-600 dark:bg-indigo-500" },
    { id: "gold", name: "Classic Gold", color: "bg-amber-500" },
    { id: "emerald", name: "Mint Emerald", color: "bg-emerald-500" },
    { id: "sunset", name: "Warm Sunset", color: "bg-orange-500" },
    { id: "rose", name: "Luxury Rose", color: "bg-rose-500" }
  ] as const;

  const renderContent = () => {
    switch(activeTab) {
      case "general":
        return (
          <div className="space-y-6 animate-fade-in">
            <Card title="Hotel Configuration" icon={<Building className="w-4 h-4 text-primary" />}>
              <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <Label htmlFor="hotelName">Property / Hotel Name</Label>
                  <Input 
                    id="hotelName" 
                    value={currentSettings.hotelName} 
                    onChange={(e) => updateSettings({ hotelName: e.target.value })} 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gstin">GSTIN Identification</Label>
                  <Input 
                    id="gstin" 
                    value={currentSettings.gstin} 
                    onChange={(e) => updateSettings({ gstin: e.target.value })} 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="taxRate">Default Tax Rate (GST %)</Label>
                  <div className="flex items-center gap-3">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="taxRate" type="number" min="0" max="100"
                      value={currentSettings.taxRate}
                      onChange={(e) => updateSettings({ taxRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Active Session Profile" icon={<Building className="w-4 h-4 text-muted-foreground" />}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Active Staff Account</span>
                  <span className="font-semibold text-foreground">{user?.name ?? "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Branch Code</span>
                  <span className="font-semibold text-foreground font-mono">{branch?.id ?? "—"}</span>
                </div>
                <div className="mt-1">
                  <span className="text-muted-foreground block">Role Privilege</span>
                  <span className="font-semibold text-foreground capitalize">{user ? ROLE_LABELS[user.role] : "—"}</span>
                </div>
              </div>
            </Card>

            <Card title="Multi-Property Settings" icon={<Hotel className="w-4 h-4 text-primary" />}>
              {canManageBranches ? (
                <div className="space-y-4 max-w-md">
                  <p className="text-xs text-muted-foreground">Register a new hotel property under your account.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Hotel Name</Label>
                      <Input value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} placeholder="StayBite Grand" />
                    </div>
                    <div className="space-y-1">
                      <Label>Branch Code</Label>
                      <Input value={newBranchCode} onChange={(e) => setNewBranchCode(e.target.value)} placeholder="SB-GRAND" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Locality / City</Label>
                    <Input value={newBranchCity} onChange={(e) => setNewBranchCity(e.target.value)} placeholder="Mumbai" />
                  </div>
                  <Button onClick={handleAddBranch} className="w-full text-xs gap-1.5"><Plus className="w-4 h-4" /> Add Hotel Branch</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center p-6 text-center border border-dashed rounded-lg bg-muted/20">
                  <Lock className="w-8 h-8 text-muted-foreground/60 mb-2" />
                  <span className="text-xs font-semibold block">Feature Locked</span>
                  <span className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">Restricted to Admins.</span>
                </div>
              )}
            </Card>
          </div>
        );
      case "environment":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-card rounded-xl ring-1 ring-border p-6 shadow-sm">
              <h3 className="text-base font-bold flex items-center gap-2 border-b pb-4 mb-4 border-border/50">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Hotel Environment & Tables
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure your restaurant environment so staff can easily bill specific tables and receive public QR Menu orders.
                </p>
                <div className="flex items-end gap-4 max-w-sm">
                  <div className="space-y-1.5 flex-1">
                    <Label htmlFor="tbl-count">Total Restaurant Tables</Label>
                    <Input 
                      id="tbl-count" 
                      type="number" 
                      value={tableCountInput}
                      onChange={(e) => setTableCountInput(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleUpdateTables}>Update Layout</Button>
                </div>
              </div>

              <div className="mt-8 border-t pt-6 border-border/50">
                <h4 className="text-sm font-semibold mb-4">Table Visualizer Mapping ({tables.length})</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {tables.map(table => (
                    <button 
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      className={`p-3 border rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${table.status === 'occupied' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'}`}
                    >
                      <span className="font-bold text-sm">{table.id}</span>
                      {table.billAmount > 0 && <span className="text-[10px] font-mono mt-1">₹{table.billAmount}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t pt-6 border-border/50">
                <h4 className="text-sm font-semibold mb-4">Room Visualizer Mapping ({rooms.length})</h4>
                <p className="text-xs text-muted-foreground mb-4">Rooms are managed in the Front Desk 'Rooms' tab.</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {rooms.map(room => (
                    <div 
                      key={room.number}
                      className={`p-3 border rounded-xl text-center flex flex-col items-center justify-center ${room.status === 'occupied' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600' : 'bg-muted/20 border-border text-muted-foreground'}`}
                    >
                      <span className="font-bold text-sm">{room.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Table Management Dialog */}
            <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>{selectedTable} Management</DialogTitle>
                </DialogHeader>
                <div className="py-6 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-border">
                  <span className="text-sm text-muted-foreground mb-1">Current Bill Outstanding</span>
                  <span className="text-4xl font-bold font-mono text-primary">
                    ₹{tables.find(t => t.id === selectedTable)?.billAmount.toFixed(2) || "0.00"}
                  </span>
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedTable(null)}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleTablePaid}>
                    Mark as Paid & Clear Table
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      case "operations":
        return (
          <div className="space-y-6 animate-fade-in">
            <Card title="Operations & Stock Control" icon={<Sliders className="w-4 h-4 text-primary" />}>
              <div className="space-y-5 max-w-lg">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                  <div className="space-y-0.5 max-w-[75%]">
                    <Label className="text-sm font-medium">Auto-Decrement Stock</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically deduct recipe ingredients when completing KDS orders.
                    </p>
                  </div>
                  <Switch 
                    checked={currentSettings.autoDecrementInventory} 
                    onCheckedChange={(c) => updateSettings({ autoDecrementInventory: c })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Low Stock Alert Threshold</Label>
                  <div className="flex items-center gap-3 max-w-[150px]">
                    <Input 
                      type="number" min="1" max="1000"
                      value={currentSettings.lowStockThreshold}
                      onChange={(e) => updateSettings({ lowStockThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      case "appearance":
        return (
          <div className="space-y-6 animate-fade-in">
            <Card title="Design System & Appearance" icon={<Palette className="w-4 h-4 text-primary" />}>
              <div className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <Label>Theme Interface Mode</Label>
                  <div className="flex gap-3 p-1 bg-muted/50 rounded-lg border">
                    <button 
                      onClick={() => updateSettings({ themeMode: "light" })}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        currentSettings.themeMode === "light" ? "bg-card text-foreground shadow-soft border border-border" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" /> Light Theme
                    </button>
                    <button 
                      onClick={() => updateSettings({ themeMode: "dark" })}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        currentSettings.themeMode === "dark" ? "bg-card text-foreground shadow-soft border border-border" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Moon className="w-4 h-4 text-indigo-400" /> Dark Theme
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Interface Accent Palette</Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {palettes.map((p) => {
                      const active = currentSettings.themePalette === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => updateSettings({ themePalette: p.id })}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-left text-xs font-medium transition-all ${
                            active ? "border-primary ring-1 ring-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${p.color} border border-white/20 flex items-center justify-center shrink-0`}>
                            {active && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <span className="truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      case "backup":
        return (
          <div className="space-y-6 animate-fade-in">
            <Card title="Database Maintenance & Backup" icon={<RotateCcw className="w-4 h-4 text-destructive" />}>
              <div className="space-y-4 max-w-lg">
                <p className="text-xs text-muted-foreground">
                  Your hospitality data is securely stored locally. Export copies or restore database sessions at any time.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex-1 gap-1.5 text-xs py-5">
                    <Download className="w-4 h-4" /> Export Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex-1 gap-1.5 text-xs py-5">
                    <Download className="w-4 h-4" /> Export PDF
                  </Button>
                </div>
                <div className="border-t border-dashed pt-4 mt-2">
                  <div className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                    <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-destructive block">Danger Zone</span>
                      <span className="text-[10px] text-muted-foreground block">Permanently wipe all records to default state.</span>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleReset} className="ml-auto text-[10px] h-8 bg-destructive text-white">
                      Wipe Data
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto h-[calc(100vh-64px)] flex flex-col">
      <PageHeader 
        title="Settings Console" 
        description="Configure your residency branding, environment mappings, and system preferences." 
      />

      <div className="flex flex-1 gap-8 mt-6 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 shrink-0 flex flex-col gap-1 pr-6 border-r border-border/40">
          <SidebarBtn active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<Building className="w-4 h-4" />} label="Property Profile" />
          <SidebarBtn active={activeTab === "environment"} onClick={() => setActiveTab("environment")} icon={<LayoutGrid className="w-4 h-4" />} label="Hotel Environment" />
          <SidebarBtn active={activeTab === "operations"} onClick={() => setActiveTab("operations")} icon={<Sliders className="w-4 h-4" />} label="Operations & Stock" />
          <SidebarBtn active={activeTab === "appearance"} onClick={() => setActiveTab("appearance")} icon={<Palette className="w-4 h-4" />} label="Appearance" />
          <SidebarBtn active={activeTab === "backup"} onClick={() => setActiveTab("backup")} icon={<RotateCcw className="w-4 h-4" />} label="Data & Backup" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-20 pr-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function SidebarBtn({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
        active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-border/50 shadow-soft p-5 border border-border/10 space-y-4">
      <h3 className="text-sm font-bold flex items-center gap-2 border-b pb-3 border-border/55">
        {icon}
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}
