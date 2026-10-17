import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/accounting")({
  head: () => ({ meta: [{ title: "Accounting — StayBite" }] }),
  component: AccountingPage,
});

import { useDataStore, Transaction } from "@/stores/data-store";

function AccountingPage() {
  const { transactions, setTransactions } = useDataStore();

  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Income");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const handleAdd = () => {
    if (!description || !amount || !method) {
      toast.error("Please fill all transaction details.");
      return;
    }
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid positive amount.");
      return;
    }
    const newTx: Transaction = {
      id: `TRX-${100 + transactions.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      description,
      type: type as any,
      amount: amt,
      method,
    };
    setTransactions([newTx, ...transactions]);
    setOpen(false);
    setDescription("");
    setType("Income");
    setAmount("");
    setMethod("");
    toast.success("Transaction recorded successfully!");
  };

  const totalIncome = transactions.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "Expense" || t.type === "Tax").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Electricity Bill" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                    <SelectItem value="Tax">Tax/Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader 
        title="Accounting & Ledger" 
        description="Daily closing, expenses, revenue, and taxes." 
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 w-full sm:w-auto justify-center"
              onClick={() => {
                setDescription("Inventory Purchase");
                setType("Expense");
                setMethod("Bank Transfer");
                setOpen(true);
              }}
            >
              <Plus className="size-3.5" /> Inventory Purchase
            </Button>
            <Button size="sm" className="gap-1.5 w-full sm:w-auto justify-center" onClick={() => setOpen(true)}>
              <Plus className="size-3.5" /> Add Transaction
            </Button>
          </div>
        }
      />
      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-4 mb-6">
        <p className="text-sm font-semibold mb-1">How expenses are tracked</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Income entries are auto-added from room checkout and table close actions. Expense entries (inventory purchases, rent,
          utilities, salary payouts) should be added manually from this page using `Add Transaction` or `Inventory Purchase`.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-xl sm:text-2xl font-bold text-success flex items-center gap-2">
              ₹{totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center text-success shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-xl sm:text-2xl font-bold text-destructive flex items-center gap-2">
              ₹{totalExpense.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center text-destructive shrink-0">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Net Balance</p>
            <p className={`text-xl sm:text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'} flex items-center gap-2`}>
              ₹{netProfit.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Date</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Transaction ID</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Description</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Type</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Method</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{t.date}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">{t.id}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">{t.description}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <Badge variant={t.type === "Income" ? "default" : t.type === "Expense" ? "destructive" : "secondary"}>
                      {t.type}
                    </Badge>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{t.method}</td>
                  <td className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono font-medium text-right whitespace-nowrap ${t.type === "Income" ? "text-success" : "text-destructive"}`}>
                    {t.type === "Income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
