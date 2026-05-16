import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { RoomStatusGrid } from "@/components/room-status-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockRooms, mockRevenueSeries, mockTransactions } from "@/lib/mock-data";
import { useSession } from "@/stores/session-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Arbor ERP" },
      {
        name: "description",
        content:
          "Live operational dashboard: revenue, room occupancy, restaurant sales, transactions.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const rooms = mockRooms();
  const revenue = mockRevenueSeries();
  const txns = mockTransactions();
  const user = useSession((s) => s.user);

  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const occupancyPct = ((occupied / rooms.length) * 100).toFixed(1);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title={`Good evening, ${user?.name.split(" ")[0] ?? "there"}`}
        description="Here's what's happening across your operations right now."
        actions={
          <>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" /> New booking
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Daily Revenue" value="$14,284" delta={8.2} hint="vs. yesterday" />
        <KpiCard label="Room Occupancy" value={`${occupancyPct}%`} delta={2.1} hint={`${occupied}/${rooms.length} rooms`} />
        <KpiCard label="Restaurant Sales" value="$4,912" delta={-0.4} hint="42 covers" />
        <KpiCard label="Pending Payments" value="$2,140" delta={-12.3} hint="14 open bills" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-8 space-y-6">
          <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold">Revenue trend</h2>
                <p className="text-xs text-muted-foreground">Last 14 days · Rooms + Restaurant</p>
              </div>
              <div className="flex gap-1.5">
                <Button variant="secondary" size="sm" className="h-7 text-xs">14D</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs">30D</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs">90D</Button>
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
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Recent transactions</h2>
                <p className="text-xs text-muted-foreground">Today · across all channels</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowUpRight className="size-3" />
              </Button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-6 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="px-6 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Guest / Table</th>
                  <th className="px-6 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txns.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                    <td className="px-6 py-3 text-sm font-medium">{t.guest}</td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">{t.channel}</td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          t.status === "Completed"
                            ? "default"
                            : t.status === "Pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-[10px] font-medium"
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-sm font-mono font-medium text-right">
                      {t.amount < 0 ? "-" : ""}${Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-xs font-mono text-muted-foreground text-right">{t.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="xl:col-span-4 space-y-6">
          <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">Room status</h2>
                <p className="text-xs text-muted-foreground">{rooms.length} rooms · Live</p>
              </div>
            </div>
            <RoomStatusGrid rooms={rooms.slice(0, 30)} />
          </div>

          <div className="bg-sidebar rounded-xl overflow-hidden ring-1 ring-sidebar-border">
            <div className="px-5 py-3 border-b border-sidebar-border flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Active check · T-14</span>
              <span className="text-[10px] font-mono text-sidebar-foreground">Server: Alex</span>
            </div>
            <div className="p-5 space-y-2.5 text-xs">
              {[
                { name: "2× Wagyu Sliders", amt: 34.0 },
                { name: "1× Truffle Fries", amt: 14.0 },
                { name: "2× Old Fashioned", amt: 32.0 },
              ].map((row) => (
                <div key={row.name} className="flex justify-between">
                  <span className="text-sidebar-foreground">{row.name}</span>
                  <span className="text-white font-mono">${row.amt.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-sidebar-border flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="font-mono font-semibold text-primary">$80.00</span>
              </div>
              <Button className="w-full mt-2">Close ticket</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
