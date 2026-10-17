import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { toast } from "sonner";
import { useDataStore } from "@/stores/data-store";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports - StayBite" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { transactions, rooms } = useDataStore();

  const revenueData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map = new Map(days.map((day) => [day, { name: day, revenue: 0, expenses: 0 }]));
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) return;
      const label = days[(date.getDay() + 6) % 7];
      const entry = map.get(label);
      if (!entry) return;
      if (tx.type === "Income") entry.revenue += tx.amount;
      else entry.expenses += tx.amount;
    });
    return days.map((day) => map.get(day)!);
  }, [transactions]);

  const occupancyData = useMemo(() => {
    const total = rooms.length || 1;
    const occupied = rooms.filter((room) => room.status === "occupied").length;
    const reserved = rooms.filter((room) => room.status === "reserved").length;
    const cleaning = rooms.filter((room) => room.status === "cleaning").length;
    const available = Math.max(0, total - occupied - reserved - cleaning);

    return [
      { name: "Occupied", rate: Math.round((occupied / total) * 100) },
      { name: "Reserved", rate: Math.round((reserved / total) * 100) },
      { name: "Cleaning", rate: Math.round((cleaning / total) * 100) },
      { name: "Available", rate: Math.round((available / total) * 100) },
    ];
  }, [rooms]);

  const totalIncome = transactions.filter((t) => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type !== "Income").reduce((sum, t) => sum + t.amount, 0);
  const net = totalIncome - totalExpenses;

  const handleExportPDF = () => {
    window.print();
    toast.success("Use print dialog to save as PDF.");
  };

  const handleExportExcel = () => {
    const header = `Metric,Value\nTotal Income,${totalIncome}\nTotal Expenses,${totalExpenses}\nNet Result,${net}\nOccupied Rooms,${rooms.filter((r) => r.status === "occupied").length}`;
    const blob = new Blob([header], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reports-summary-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported in Excel format.");
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Reports & Analytics"
        description="Revenue, expenses, occupancy, and exports."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportExcel}>
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleExportPDF}>
              <FileText className="w-3.5 h-3.5" /> Export PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
          <h3 className="text-sm font-semibold mb-4">Weekly Revenue vs Expenses (Rs)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value}`} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
          <h3 className="text-sm font-semibold mb-4">Current Room Status Distribution (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="rate" name="Rate" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--chart-2))" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
        <h3 className="text-sm font-semibold mb-4">Summary Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Total Income" value={`Rs ${totalIncome.toLocaleString("en-IN")}`} trend="Auto from ledger" />
          <MetricCard title="Total Expenses" value={`Rs ${totalExpenses.toLocaleString("en-IN")}`} trend="Auto + manual" isNegative />
          <MetricCard title="Net Result" value={`Rs ${net.toLocaleString("en-IN")}`} trend={net >= 0 ? "Positive" : "Negative"} isNegative={net < 0} />
          <MetricCard title="Rooms Occupied" value={`${rooms.filter((r) => r.status === "occupied").length}/${rooms.length}`} trend="Live snapshot" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, isNegative }: { title: string; value: string; trend: string; isNegative?: boolean }) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-2xl font-semibold">{value}</h4>
        <span className={`text-xs font-medium ${isNegative ? "text-destructive" : "text-success"}`}>{trend}</span>
      </div>
    </div>
  );
}
