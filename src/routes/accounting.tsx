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
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
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
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-3.5" /> Add Transaction
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-2xl font-bold text-success flex items-center gap-2">
              ₹{totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center text-success">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-destructive flex items-center gap-2">
              ₹{totalExpense.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'} flex items-center gap-2`}>
              ₹{netProfit.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Description</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Type</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Method</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm text-muted-foreground">{t.date}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{t.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{t.description}</td>
                <td className="px-6 py-4">
                  <Badge variant={t.type === "Income" ? "default" : t.type === "Expense" ? "destructive" : "secondary"}>
                    {t.type}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{t.method}</td>
                <td className={`px-6 py-4 text-sm font-mono font-medium text-right ${t.type === "Income" ? "text-success" : "text-destructive"}`}>
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
  );
}
