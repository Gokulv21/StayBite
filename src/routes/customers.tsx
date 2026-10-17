import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Trash2, User, Phone, History, Printer } from "lucide-react";
import { MessagingModal } from "@/components/messaging-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { printElement } from "@/lib/print";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — StayBite" }] }),
  component: CustomersPage,
});

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  loyalty: "Gold" | "Silver" | "Bronze";
}

import { useDataStore } from "@/stores/data-store";
import { Search } from "lucide-react";

function CustomersPage() {
  const { customers, setCustomers, invoices } = useDataStore();

  const [messagingOpen, setMessagingOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleMessage = (customer: Customer) => {
    setSelectedCustomer(customer);
    setMessagingOpen(true);
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast.success("Customer deleted.");
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
      <MessagingModal open={messagingOpen} onOpenChange={setMessagingOpen} customer={selectedCustomer} />

      <PageHeader
        title="Customers"
        description="Guest profiles, loyalty points and history."
      />

      {/* Search Bar */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, phone, email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-9 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[550px]">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">ID</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Name</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Contact</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Tier</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">{c.id}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleCustomerClick(c)}
                      className="hover:underline text-primary hover:text-primary/80 transition-colors text-left font-semibold cursor-pointer"
                    >
                      {c.name}
                    </button>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    <div>{c.phone}</div>
                    <div className="text-xs">{c.email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <Badge variant={c.loyalty === "Gold" ? "default" : "secondary"}>{c.loyalty}</Badge>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => handleMessage(c)}>
                        <MessageCircle className="w-3.5 h-3.5" /> Message
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details & History Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <User className="w-5 h-5 text-primary" /> Guest Profile Console
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 py-4">
              {/* Profile Card */}
              <div className="bg-muted/40 p-5 rounded-xl border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">{selectedCustomer.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{selectedCustomer.id}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                  <Badge variant={selectedCustomer.loyalty === "Gold" ? "default" : selectedCustomer.loyalty === "Silver" ? "secondary" : "outline"} className="capitalize">
                    {selectedCustomer.loyalty} Tier
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Total Visits: <strong className="text-foreground">{selectedCustomer.visits}</strong>
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-card p-4 rounded-xl border">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/75" /> Phone Number
                  </span>
                  <p className="font-semibold">{selectedCustomer.phone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground/75" /> Email Address
                  </span>
                  <p className="font-semibold truncate">{selectedCustomer.email || "N/A"}</p>
                </div>
              </div>

              {/* Billing / Invoice History */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> Billing & Invoice History
                </h4>

                <div className="border rounded-xl overflow-hidden bg-card max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border sticky top-0">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-muted-foreground uppercase">Inv No</th>
                        <th className="px-4 py-2 font-semibold text-muted-foreground uppercase">Date</th>
                        <th className="px-4 py-2 font-semibold text-muted-foreground uppercase">Room</th>
                        <th className="px-4 py-2 font-semibold text-muted-foreground uppercase text-right">Amount</th>
                        <th className="px-4 py-2 font-semibold text-muted-foreground uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoices.filter(inv => inv.guestPhone === selectedCustomer.phone).map((inv) => (
                        <tr key={inv.invoiceNo} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium">{inv.invoiceNo}</td>
                          <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                          <td className="px-4 py-3 font-medium">Room {inv.roomNumber}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-right text-primary font-bold">₹{inv.grandTotal.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 text-[10px] gap-1 px-2 hover:bg-emerald-600 hover:text-white transition-all duration-200"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setInvoiceOpen(true);
                              }}
                            >
                              <Printer className="w-3 h-3" /> Reprint
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {invoices.filter(inv => inv.guestPhone === selectedCustomer.phone).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground italic">
                            No billing history found for this guest.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Reprint Modal */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-[480px] max-h-[90vh] overflow-y-auto p-0 ring-1 ring-border shadow-2xl rounded-2xl">
          <div id="print-area" className="p-6 bg-white text-zinc-950 space-y-6">

            {/* Invoice Header */}
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">StayBite Residency</h2>
              <p className="text-xs text-muted-foreground">Premium Residency & Restaurant Suite</p>
              <p className="text-[10px] text-muted-foreground font-mono">GSTIN: 33AAAAA1111A1Z1 (Demo)</p>
              <div className="pt-2">
                <span className="bg-zinc-100 text-zinc-800 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  OFFICIAL TAX INVOICE
                </span>
              </div>
            </div>

            {/* Invoice Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b pb-4">
              <div>
                <span className="text-zinc-500 block">Invoice No:</span>
                <span className="font-semibold font-mono text-zinc-900">{selectedInvoice?.invoiceNo}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block">Date:</span>
                <span className="font-semibold text-zinc-900">{selectedInvoice?.date}</span>
              </div>
              <div className="mt-1">
                <span className="text-zinc-500 block">Guest Name:</span>
                <span className="font-semibold text-zinc-900">{selectedInvoice?.guestName}</span>
              </div>
              <div className="text-right mt-1">
                <span className="text-zinc-500 block">Room Charged:</span>
                <span className="font-semibold text-zinc-900">Room {selectedInvoice?.roomNumber}</span>
              </div>
              {selectedInvoice?.guestPhone && (
                <div className="mt-1 col-span-2">
                  <span className="text-zinc-500">Phone: </span>
                  <span className="font-semibold text-zinc-900">{selectedInvoice.guestPhone}</span>
                </div>
              )}
            </div>

            {/* Itemized charges */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Itemized Billing Description</span>
              <div className="space-y-2 text-xs text-zinc-800">
                <div className="flex justify-between items-center py-1">
                  <span>Room Tariff Rate (1 Night)</span>
                  <span className="font-semibold font-mono">₹{selectedInvoice?.roomRate?.toFixed(2)}</span>
                </div>

                {selectedInvoice?.completedOrders?.length > 0 && (
                  <div className="border-t pt-2 space-y-1.5">
                    <span className="text-[10px] text-zinc-500 font-medium uppercase">Restaurant & Bar Charges</span>
                    {selectedInvoice.completedOrders.map((ord: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{ord.description}</span>
                        <span className="font-mono font-semibold">₹{ord.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t pt-4 text-xs space-y-1.5 bg-zinc-50 p-3 rounded-lg">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal (Base Tariff)</span>
                <span className="font-mono">₹{((selectedInvoice?.roomRate || 0) + (selectedInvoice?.ordersTotal || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>CGST / SGST (Included)</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-2 text-zinc-900">
                <span>Grand Total Paid</span>
                <span className="font-mono text-zinc-900">₹{selectedInvoice?.grandTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>Settled Via:</span>
                <span className="font-bold text-zinc-700">{selectedInvoice?.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-zinc-500 pt-2 border-t">
              <p>Thank you for choosing StayBite Residency!</p>
              <p className="italic">Please visit us again.</p>
            </div>
          </div>

          {/* Action buttons (Hidden during printing) */}
          <div className="p-4 bg-zinc-100 border-t flex gap-2 justify-end no-print">
            <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(false)}>
              Close
            </Button>
            <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => printElement("print-area", `Invoice - ${selectedInvoice?.invoiceNo || "Receipt"}`)}>
              <Printer className="w-3.5 h-3.5" /> Print Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
