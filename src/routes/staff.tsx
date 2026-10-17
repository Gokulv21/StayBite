import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff — StayBite" }] }),
  component: StaffPage,
});

import { useDataStore, Staff } from "@/stores/data-store";
import { Search } from "lucide-react";

function StaffPage() {
  const { staffList, setStaffList } = useDataStore();

  const [open, setOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [shift, setShift] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAddNew = () => {
    setEditingStaffId(null);
    setName("");
    setRole("");
    setShift("");
    setCountryCode("+91");
    setPhone("");
    setEmail("");
    setSalary("");
    setJoiningDate(new Date().toISOString().split("T")[0]);
    setOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaffId(staff.id);
    setName(staff.name);
    setRole(staff.role);
    setShift(staff.shift);
    
    if (staff.phone) {
      const parts = staff.phone.split(" ");
      if (parts.length > 1) {
        setCountryCode(parts[0]);
        setPhone(parts[1]);
      } else {
        setCountryCode("+91");
        setPhone(staff.phone);
      }
    } else {
      setCountryCode("+91");
      setPhone("");
    }
    
    setEmail(staff.email || "");
    setSalary(staff.salary !== undefined ? staff.salary.toString() : "");
    setJoiningDate(staff.joiningDate || new Date().toISOString().split("T")[0]);
    setOpen(true);
  };

  const handleSave = () => {
    if (!name || !role || !shift) {
      toast.error("Please fill all required details (Name, Role, and Shift).");
      return;
    }
    
    if (phone && phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    const numericSalary = salary ? parseFloat(salary) : undefined;
    const today = new Date().toISOString().split("T")[0];

    if (editingStaffId) {
      setStaffList(staffList.map(s => {
        if (s.id === editingStaffId) {
          const history = [...(s.salaryHistory || [])];
          
          if (history.length === 0 && s.salary !== undefined) {
            history.push({ date: s.joiningDate || today, amount: s.salary });
          }

          const lastHistory = history.length > 0 ? history[history.length - 1].amount : undefined;
          if (numericSalary !== undefined && numericSalary !== lastHistory) {
            history.push({ date: today, amount: numericSalary });
          }

          return {
            ...s,
            name,
            role,
            shift,
            phone: phone ? `${countryCode} ${phone}` : undefined,
            email: email || undefined,
            salary: numericSalary,
            joiningDate: joiningDate || undefined,
            salaryHistory: history,
          };
        }
        return s;
      }));
      toast.success("Staff member updated successfully!");
    } else {
      const initialHistory = numericSalary !== undefined ? [{ date: joiningDate || today, amount: numericSalary }] : [];
      const newStaff: Staff = {
        id: `S-${100 + staffList.length + 1}`,
        name,
        role,
        status: "Active",
        shift,
        phone: phone ? `${countryCode} ${phone}` : undefined,
        email: email || undefined,
        salary: numericSalary,
        joiningDate: joiningDate || undefined,
        salaryHistory: initialHistory,
        password: "pass" + Math.floor(100 + Math.random() * 900) // E.g., pass482
      };
      setStaffList([...staffList, newStaff]);
      toast.success(`Staff member added! Login ID: ${newStaff.id}, Password: ${newStaff.password}`, { duration: 10000 });
    }
    
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setStaffList(staffList.filter(s => s.id !== id));
    toast.success("Staff member deleted.");
  };

  const filteredStaff = staffList.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaffId ? "Edit Staff Member" : "Add New Staff"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[85px] shrink-0">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                    <SelectItem value="+61">🇦🇺 +61</SelectItem>
                    <SelectItem value="+971">🇦🇪 +971</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  value={phone} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setPhone(val);
                  }} 
                  placeholder="9876543210" 
                  type="tel" 
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane.doe@example.com" type="email" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Operational Role & Permission Set</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="housekeeping">🧹 Cleaner (Housekeeping Team)</SelectItem>
                  <SelectItem value="cashier">💳 POS Cashier (Billing Team)</SelectItem>
                  <SelectItem value="kitchen">🍳 Kitchen Staff (Cooking Team)</SelectItem>
                  <SelectItem value="receptionist">🛎️ Receptionist (Front Desk)</SelectItem>
                  <SelectItem value="owner">👑 Hotel Owner (Master Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Shift Timing</Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning (8AM - 4PM)">Morning (8AM - 4PM)</SelectItem>
                  <SelectItem value="Evening (4PM - 12AM)">Evening (4PM - 12AM)</SelectItem>
                  <SelectItem value="Night (12AM - 8AM)">Night (12AM - 8AM)</SelectItem>
                  <SelectItem value="All (Full Day)">All (Full Day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Monthly Salary (INR)</Label>
              <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="25000" type="number" min="0" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Joining Date</Label>
              <Input value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} type="date" />
            </div>
            
            {editingStaffId && staffList.find(s => s.id === editingStaffId)?.salaryHistory && staffList.find(s => s.id === editingStaffId)!.salaryHistory!.length > 0 && (
              <div className="col-span-2 mt-4 space-y-3">
                <Label className="flex items-center gap-1.5 text-primary"><TrendingUp className="w-4 h-4" /> Salary Progression Tracker</Label>
                <div className="bg-muted/30 border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase border-b pb-1.5">
                    <span>Effective Date</span>
                    <span>Amount (INR)</span>
                  </div>
                  {staffList.find(s => s.id === editingStaffId)?.salaryHistory?.map((hist, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-0 border-border/40">
                      <span className="font-mono">{new Date(hist.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="font-medium text-emerald-600">₹{hist.amount.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingStaffId ? "Update Member" : "Save User Account"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader 
        title="User & Staff Management" 
        description="Configure staff roles, access permissions, and shift schedules." 
        actions={
          <Button size="sm" className="gap-1.5 w-full sm:w-auto justify-center" onClick={handleAddNew}>
            <Plus className="size-3.5" /> Add Staff Member
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, role, ID, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-9 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      
      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">ID</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Name & Contact</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Role</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Status</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Shift</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Salary</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">Joining Date</th>
                <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">{s.id}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="font-medium text-sm text-foreground">{s.name}</div>
                    {(s.phone || s.email) && (
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
                        {s.phone && <span className="flex items-center gap-1">📞 {s.phone}</span>}
                        {s.email && <span className="flex items-center gap-1 truncate max-w-[200px]">✉️ {s.email}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 capitalize text-xs sm:text-sm whitespace-nowrap">
                    {s.role === "manager" ? "👔 Manager" :
                     s.role === "receptionist" ? "🛎️ Front Desk" :
                     s.role === "kitchen" ? "🍳 Kitchen Chef" :
                     s.role === "cashier" ? "💳 POS Cashier" :
                     s.role === "housekeeping" ? "🧹 Housekeeping" : "Staff"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <Badge variant={s.status === "Active" ? "default" : "secondary"}>{s.status}</Badge>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{s.shift}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold font-mono text-foreground whitespace-nowrap">
                    {s.salary ? `₹${s.salary.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground font-mono whitespace-nowrap">
                    {s.joiningDate ? new Date(s.joiningDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(s)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No staff members found.
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
