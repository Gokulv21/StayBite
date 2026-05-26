import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — StayBite" }] }),
  component: ReportsPage,
});

const revenueData = [
  { name: "Mon", revenue: 0, expenses: 0 },
  { name: "Tue", revenue: 0, expenses: 0 },
  { name: "Wed", revenue: 0, expenses: 0 },
  { name: "Thu", revenue: 0, expenses: 0 },
  { name: "Fri", revenue: 0, expenses: 0 },
  { name: "Sat", revenue: 0, expenses: 0 },
  { name: "Sun", revenue: 0, expenses: 0 },
];

const occupancyData = [
  { name: "Week 1", rate: 0 },
  { name: "Week 2", rate: 0 },
  { name: "Week 3", rate: 0 },
  { name: "Week 4", rate: 0 },
];

function ReportsPage() {
  const handleExportPDF = () => {
    window.print();
    toast.success("Use print dialog to save as PDF.");
  };

  const handleExportExcel = () => {
    const header = "Metric,Value\nTotal RevPAR,2450\nADR,3100\nCancellations,4\nDirect Bookings,68";
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
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader 
        title="Reports & Analytics" 
        description="Sales, occupancy, P&L, exports." 
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
          <h3 className="text-sm font-semibold mb-4">7-Day Revenue vs Expenses (₹)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} 
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
          <h3 className="text-sm font-semibold mb-4">Monthly Occupancy Rate (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} 
                />
                <Line type="monotone" dataKey="rate" name="Occupancy" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--chart-2))" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
        <h3 className="text-sm font-semibold mb-4">Summary Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Total RevPAR" value="₹2,450" trend="+12%" />
          <MetricCard title="ADR" value="₹3,100" trend="+5%" />
          <MetricCard title="Cancellations" value="4" trend="-2" isNegative />
          <MetricCard title="Direct Bookings" value="68%" trend="+4%" />
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
        <span className={`text-xs font-medium ${isNegative ? 'text-destructive' : 'text-success'}`}>{trend}</span>
      </div>
    </div>
  );
}
