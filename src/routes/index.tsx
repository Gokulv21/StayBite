import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Plus, ArrowUpRight, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { RoomStatusGrid } from "@/components/room-status-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTransactions } from "@/lib/mock-data";
import { useSession } from "@/stores/session-store";
import { useDataStore } from "@/stores/data-store";
import { PaywallModal } from "@/components/paywall-modal";
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard - StayBite" },
      {
        name: "description",
        content:
          "Live operational dashboard: revenue, room occupancy, restaurant sales, transactions.",
      },
    ],
  }),
  component: DashboardPage,
});

function formatRs(value: number) {
  return `Rs ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

type RevenueRange = "week" | "month" | "year" | "custom";

type RevenuePoint = { day: string; rooms: number; restaurant: number };

function parseDate(dateText: string) {
  const parsed = new Date(dateText);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const parts = dateText.split("/");
  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
      const d = new Date(year, month - 1, day);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return null;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildRevenueSeries(
  range: RevenueRange,
  invoices: Array<{ date: string; checkoutDate?: string; grandTotal: number }>,
  transactions: Array<{ date: string; description: string; type: string; amount: number }>,
  fromDate?: string,
  toDate?: string,
) {
  const now = new Date();
  let start = startOfDay(new Date(now));
  let end = startOfDay(new Date(now));

  if (range === "week") {
    start.setDate(end.getDate() - 6);
  } else if (range === "month") {
    start.setDate(end.getDate() - 29);
  } else if (range === "year") {
    start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
  } else {
    const from = fromDate ? parseDate(fromDate) : null;
    const to = toDate ? parseDate(toDate) : null;
    if (!from || !to || from > to) return [];
    start = startOfDay(from);
    end = startOfDay(to);
  }

  const map = new Map<string, RevenuePoint>();
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    map.set(key, {
      day:
        range === "year"
          ? cursor.toLocaleString("en-US", { month: "short" })
          : cursor.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      rooms: 0,
      restaurant: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  invoices.forEach((inv) => {
    const d = parseDate(inv.checkoutDate || inv.date);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    const slot = map.get(key);
    if (slot) slot.rooms += inv.grandTotal || 0;
  });

  transactions.forEach((tx) => {
    if (tx.type !== "Income") return;
    const d = parseDate(tx.date);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    const slot = map.get(key);
    if (!slot) return;
    if (tx.description.toLowerCase().includes("restaurant") || tx.description.toLowerCase().includes("table")) {
      slot.restaurant += tx.amount || 0;
    } else if (!tx.description.toLowerCase().includes("checkout")) {
      slot.restaurant += tx.amount || 0;
    }
  });

  const points = Array.from(map.values());
  if (range === "year") {
    const monthAgg = new Map<string, RevenuePoint>();
    points.forEach((point) => {
      const existing = monthAgg.get(point.day) ?? { day: point.day, rooms: 0, restaurant: 0 };
      existing.rooms += point.rooms;
      existing.restaurant += point.restaurant;
      monthAgg.set(point.day, existing);
    });
    return Array.from(monthAgg.values());
  }
  return points;
}

function DashboardPage() {
  const navigate = useNavigate();
  const txns = mockTransactions();
  const user = useSession((s) => s.user);
  const { inventory, rooms: liveRooms, kdsTickets, tables, clearTable, transactions, setTransactions, invoices } = useDataStore();
  const rooms = liveRooms;
  const table14 = tables.find((item) => item.id === "T-14");
  const table14Amount = table14?.billAmount ?? 0;

  const [paywallOpen, setPaywallOpen] = useState(false);
  const [channelFilter, setChannelFilter] = useState<"All" | "Room" | "Restaurant" | "Bar">("All");
  const [search, setSearch] = useState("");
  const [revenueRange, setRevenueRange] = useState<RevenueRange>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const revenue = useMemo(
    () => buildRevenueSeries(revenueRange, invoices, transactions, customFrom, customTo),
    [revenueRange, customFrom, customTo, invoices, transactions],
  );

  const filteredTxns = useMemo(() => {
    return txns.filter((t) => {
      const matchesChannel = channelFilter === "All" || t.channel === channelFilter;
      const matchesSearch =
        search.trim().length === 0 ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.guest.toLowerCase().includes(search.toLowerCase());
      return matchesChannel && matchesSearch;
    });
  }, [txns, channelFilter, search]);

  const insights = useMemo(() => {
    const generated = [];
    const lowStock = inventory.filter((i) => i.quantity <= 5);
    if (lowStock.length > 0) {
      generated.push({
        id: "inv-warn",
        icon: <AlertTriangle className="size-4 text-amber-500" />,
        title: "Low Stock Alert",
        message: `Restock soon: ${lowStock
          .slice(0, 2)
          .map((i) => i.name)
          .join(", ")}.`,
        bg: "bg-amber-500/10",
      });
    }

    const vacantRooms = liveRooms.filter((r) => r.status === "available");
    if (vacantRooms.length > 0) {
      generated.push({
        id: "room-opp",
        icon: <Lightbulb className="size-4 text-primary" />,
        title: "Vacant Rooms",
        message: `${vacantRooms.length} rooms available now. Push offers to increase occupancy.`,
        bg: "bg-primary/10",
      });
    }

    const pendingTickets = kdsTickets.filter((t) => t.status === "pending");
    if (pendingTickets.length > 5) {
      generated.push({
        id: "kds-warn",
        icon: <TrendingUp className="size-4 text-rose-500" />,
        title: "Kitchen Queue",
        message: `${pendingTickets.length} tickets pending. Assign one extra chef now.`,
        bg: "bg-rose-500/10",
      });
    }

    if (generated.length === 0) {
      generated.push({
        id: "all-good",
        icon: <Sparkles className="size-4 text-emerald-500" />,
        title: "Operations Healthy",
        message: "No urgent issues detected across rooms, kitchen, and stock.",
        bg: "bg-emerald-500/10",
      });
    }
    return generated;
  }, [inventory, liveRooms, kdsTickets]);

  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const occupancyPct = rooms.length > 0 ? ((occupied / rooms.length) * 100).toFixed(1) : "0.0";

  const totalTxnValue = txns.reduce((sum, t) => sum + t.amount, 0);
  const completedCount = txns.filter((t) => t.status === "Completed").length;
  const pendingAmount = txns
    .filter((t) => t.status === "Pending")
    .reduce((sum, t) => sum + t.amount, 0);
  const latestDailyRevenue =
    revenue.length > 0 ? revenue[revenue.length - 1].rooms + revenue[revenue.length - 1].restaurant : 0;

  const withPaidAccess = (action: () => void) => {
    if (user?.status === "unpaid") {
      setPaywallOpen(true);
    } else {
      action();
    }
  };

  const handleExport = () => {
    withPaidAccess(() => {
      const header = ["ID", "Guest/Table", "Channel", "Status", "Amount", "Time"];
      const rows = filteredTxns.map((t) => [
        t.id,
        t.guest,
        t.channel,
        t.status,
        String(t.amount),
        t.at,
      ]);
      const tableHtml = `
        <table>
          <thead><tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      `;
      const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-transactions-${new Date().toISOString().slice(0, 10)}.xls`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Transactions exported in Excel format.");
    });
  };

  const handleNewBooking = () => {
    withPaidAccess(() => {
      navigate({ to: "/rooms" });
      toast.success("Open Rooms to create a new booking.");
    });
  };

  const handleCloseTicket = () => {
    if (!table14) {
      toast.error("Table T-14 not found.");
      return;
    }
    if (table14.billAmount <= 0) {
      toast.info("No open ticket on T-14.");
      return;
    }
    const newTx = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      description: `Restaurant Bill - ${table14.id}`,
      type: "Income" as const,
      amount: table14.billAmount,
      method: "Cash",
    };
    setTransactions([newTx, ...transactions]);
    clearTable(table14.id);
    toast.success(`${table14.id} ticket closed successfully.`);
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />

      <PageHeader
        title={`Welcome, ${user?.name.split(" ")[0] ?? "there"} 👋`}
        description="Live operations overview"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleNewBooking}>
              <Plus className="size-3.5" /> New booking
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Today's Revenue" value={formatRs(latestDailyRevenue)} delta={0} hint="latest trend" />
        <KpiCard label="Occupancy" value={`${occupancyPct}%`} delta={0} hint={`${occupied}/${rooms.length} rooms`} />
        <KpiCard label="Transactions" value={String(completedCount)} delta={0} hint={`${txns.length} total`} />
        <KpiCard label="Pending" value={formatRs(pendingAmount)} delta={0} hint={formatRs(totalTxnValue)} />
      </div>
      <div className="bg-card rounded-xl ring-1 ring-border p-3 sm:p-4 mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Quick Shortcuts</h2>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => navigate({ to: "/rooms" })}>New Booking</Button>
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => navigate({ to: "/rooms" })}>Add Room</Button>
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => navigate({ to: "/inventory" })}>Add Stock</Button>
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => navigate({ to: "/pos" })}>Open POS</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        <section className="xl:col-span-8 space-y-6">
          <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold">Revenue Trend</h2>
                <p className="text-xs text-muted-foreground">Rooms + Restaurant</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={revenueRange} onValueChange={(value) => setRevenueRange(value as RevenueRange)}>
                  <SelectTrigger className="h-8 w-full sm:w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last week</SelectItem>
                    <SelectItem value="month">Last month</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
                {revenueRange === "custom" && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 text-xs flex-1" />
                    <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 text-xs flex-1" />
                  </div>
                )}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-rooms" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-rest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="rooms" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g-rooms)" />
                  <Area type="monotone" dataKey="restaurant" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#g-rest)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl ring-1 ring-border shadow-soft overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Recent Transactions</h2>
                <p className="text-xs text-muted-foreground">All channels today</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1 shrink-0" onClick={() => navigate({ to: "/accounting" })}>
                View all <ArrowUpRight className="size-3" />
              </Button>
            </div>
            <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-border flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-xs w-full"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {(["All", "Room", "Restaurant", "Bar"] as const).map((channel) => (
                  <Button
                    key={channel}
                    size="sm"
                    variant={channelFilter === channel ? "secondary" : "ghost"}
                    className="h-7 text-xs shrink-0"
                    onClick={() => setChannelFilter(channel)}
                  >
                    {channel}
                  </Button>
                ))}
              </div>
            </div>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-border">
              {filteredTxns.map((t) => (
                <div key={t.id} className="px-4 py-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{t.guest}</span>
                    <span className="font-mono text-sm font-bold shrink-0">{formatRs(Math.abs(t.amount))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={t.status === "Completed" ? "default" : t.status === "Pending" ? "secondary" : "destructive"}
                      className="text-[10px]"
                    >{t.status}</Badge>
                    <span className="text-xs text-muted-foreground">{t.channel}</span>
                    <span className="text-xs text-muted-foreground ml-auto font-mono">{t.at}</span>
                  </div>
                </div>
              ))}
              {filteredTxns.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">No transactions match the filter.</div>
              )}
            </div>
            {/* Desktop table */}
            <table className="hidden sm:table w-full text-left">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Guest / Table</th>
                  <th className="px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Channel</th>
                  <th className="px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                  <th className="px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                    <td className="px-5 py-3 text-sm font-medium">{t.guest}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{t.channel}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={t.status === "Completed" ? "default" : t.status === "Pending" ? "secondary" : "destructive"}
                        className="text-[10px] font-medium"
                      >{t.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-sm font-mono font-medium text-right">
                      {t.amount < 0 ? "-" : ""}{formatRs(Math.abs(t.amount))}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground text-right">{t.at}</td>
                  </tr>
                ))}
                {filteredTxns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-xs text-muted-foreground">No transactions match the current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="xl:col-span-4 space-y-6">
          <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-base font-semibold">Operational Alerts</h2>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Quick action suggestions based on stock, room availability, and kitchen queue.
            </p>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                  <div className={`size-8 rounded-full ${insight.bg} flex items-center justify-center shrink-0`}>
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">Stay Overview</h2>
                <p className="text-xs text-muted-foreground">{rooms.length} rooms - Live</p>
              </div>
            </div>
            <RoomStatusGrid rooms={rooms.slice(0, 30)} />
          </div>

          <div className="bg-sidebar rounded-xl overflow-hidden ring-1 ring-sidebar-border">
            <div className="px-5 py-3 border-b border-sidebar-border flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Table Service - T-14</span>
              <span className="text-[10px] font-mono text-sidebar-foreground">Server: Alex</span>
            </div>
            <div className="p-5 space-y-2.5 text-xs">
              {[
                { name: "2x Wagyu Sliders", amt: 34.0 },
                { name: "1x Truffle Fries", amt: 14.0 },
                { name: "2x Old Fashioned", amt: 32.0 },
              ].map((row) => (
                <div key={row.name} className="flex justify-between">
                  <span className="text-sidebar-foreground">{row.name}</span>
                  <span className="text-white font-mono">{formatRs(row.amt)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-sidebar-border flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="font-mono font-semibold text-primary">{formatRs(table14Amount)}</span>
              </div>
              <Button className="w-full mt-2" onClick={handleCloseTicket}>Close ticket</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
