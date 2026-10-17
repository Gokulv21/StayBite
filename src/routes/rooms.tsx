import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RoomStatusGrid } from "@/components/room-status-grid";
import { Button } from "@/components/ui/button";
import { Plus, Hotel, Trash2, Receipt, CreditCard, Sparkles, User, Phone, Users, FileText, Calendar, Printer, MessageCircle, ChefHat, QrCode, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataStore, RoomData } from "@/stores/data-store";
import { printElement } from "@/lib/print";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Bookings — StayBite" },
      { name: "description", content: "Live room grid, reservations, check-in and check-out." },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const { rooms, setRooms, clearRoomFolio, transactions, setTransactions, customers, setCustomers, invoices, setInvoices, settings } = useDataStore();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrRoom, setSelectedQrRoom] = useState<string>("all");
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<RoomData | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  // Booking form states
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCountryCode, setGuestCountryCode] = useState("+91");
  const [guestsCount, setGuestsCount] = useState("1");
  const [idType, setIdType] = useState("Aadhar");
  const [idNumber, setIdNumber] = useState("");
  const [checkinDate, setCheckinDate] = useState(new Date().toISOString().split("T")[0]);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkoutDate, setCheckoutDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [selectedRoom, setSelectedRoom] = useState("");

  // Room status filter for Housekeeping & Front Desk
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Split Payment states
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [splitMethod1, setSplitMethod1] = useState("UPI");
  const [splitAmount1, setSplitAmount1] = useState("");
  const [splitMethod2, setSplitMethod2] = useState("Cash");
  const [splitAmount2, setSplitAmount2] = useState("");

  // Room creation states
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomType, setNewRoomType] = useState("");
  const [customRoomType, setCustomRoomType] = useState("");
  const [customBedType, setCustomBedType] = useState("");
  const [newRoomPrice, setNewRoomPrice] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState("");
  const [newRoomSize, setNewRoomSize] = useState("");
  const [newBedTypes, setNewBedTypes] = useState<string[]>([]);
  const [newRoomView, setNewRoomView] = useState("");
  const [newSmokingPolicy, setNewSmokingPolicy] = useState("Non-Smoking");
  const [newAmenities, setNewAmenities] = useState<string[]>([]);

  const AMENITIES_LIST = ["Free WiFi", "Air Conditioning", "Flat-screen TV", "Mini-bar", "Balcony", "Bathtub", "Kitchenette"];
  const BED_TYPES = ["King", "Queen", "Twin", "Single", "Bunk", "Sofa Cum Bed", "Custom"];

  const toggleAmenity = (am: string) => {
    setNewAmenities(prev => prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]);
  };

  const toggleBedType = (bedType: string) => {
    setNewBedTypes((prev) =>
      prev.includes(bedType) ? prev.filter((item) => item !== bedType) : [...prev, bedType],
    );
  };

  const handleAddBooking = () => {
    if (!guestName || !selectedRoom || !guestPhone || !checkoutDate) {
      toast.error("Please fill required guest details (Name, Phone, Checkout Date, Room).");
      return;
    }
    
    if (guestPhone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    const checkin = checkinDate || new Date().toISOString().split("T")[0];
    const diffMs = new Date(checkoutDate).getTime() - new Date(checkin).getTime();
    const stayNights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1);

    setRooms(rooms.map(r => r.number === selectedRoom ? { 
      ...r, 
      status: "occupied",
      guestName,
      guestPhone: `${guestCountryCode} ${guestPhone}`,
      guestsCount,
      idType,
      idNumber,
      checkinDate: checkin,
      checkoutDate,
      nights: stayNights,
    } : r));
    toast.success(`Booking confirmed for ${guestName} in Room ${selectedRoom} (${stayNights} Night${stayNights > 1 ? 's' : ''})!`);
    setBookingOpen(false);
    setGuestName("");
    setGuestPhone("");
    setGuestCountryCode("+91");
    setGuestsCount("1");
    setIdType("Aadhar");
    setIdNumber("");
    setCheckinDate(new Date().toISOString().split("T")[0]);
    const tomorrowReset = new Date();
    tomorrowReset.setDate(tomorrowReset.getDate() + 1);
    setCheckoutDate(tomorrowReset.toISOString().split("T")[0]);
    setSelectedRoom("");
  };

  const handleAddRoom = () => {
    if (!newRoomNumber) {
      toast.error("Room number is required.");
      return;
    }
    if (rooms.find(r => r.number === newRoomNumber)) {
      toast.error("Room already exists.");
      return;
    }
    const finalRoomType = newRoomType === "Custom" ? customRoomType : (newRoomType || "Standard");
    const finalBedTypes = newBedTypes.map(b => b === "Custom" ? (customBedType || "Custom") : b);
    const newRoom: RoomData = {
      number: newRoomNumber,
      status: "available",
      type: finalRoomType,
      price: newRoomPrice || "1000",
      capacity: newRoomCapacity || "2",
      size: newRoomSize || "300",
      bedType: finalBedTypes.length > 0 ? finalBedTypes.join(", ") : "Queen",
      view: newRoomView || "None",
      smoking: newSmokingPolicy,
      amenities: newAmenities,
      orders: [],
    };
    setRooms([...rooms, newRoom].sort((a, b) => a.number.localeCompare(b.number)));
    toast.success(`Room ${newRoomNumber} added successfully!`);
    setRoomOpen(false);
    setNewRoomNumber("");
    setNewRoomType("");
    setCustomRoomType("");
    setNewRoomPrice("");
    setNewRoomCapacity("");
    setNewRoomSize("");
    setNewBedTypes([]);
    setCustomBedType("");
    setNewRoomView("");
    setNewSmokingPolicy("Non-Smoking");
    setNewAmenities([]);
  };

  const handleDeleteRoom = () => {
    if (!selectedRoomDetails) return;
    setRooms(rooms.filter(r => r.number !== selectedRoomDetails.number));
    toast.success(`Room ${selectedRoomDetails.number} deleted successfully.`);
    setDetailsOpen(false);
  };

  const handleRoomClick = (room: RoomData) => {
    setSelectedRoomDetails(room);
    setDetailsOpen(true);
  };

  const handleMarkCleaned = () => {
    if (!selectedRoomDetails) return;
    setRooms(rooms.map(r => r.number === selectedRoomDetails.number ? { ...r, status: "available" } : r));
    toast.success(`Room ${selectedRoomDetails.number} is now Available.`);
    setDetailsOpen(false);
  };

  const handleStatusUpdate = (status: RoomData["status"]) => {
    if (!selectedRoomDetails) return;
    setRooms(rooms.map((room) => (room.number === selectedRoomDetails.number ? { ...room, status } : room)));
    setSelectedRoomDetails({ ...selectedRoomDetails, status });
    toast.success(`Room ${selectedRoomDetails.number} status updated to ${status}.`);
  };

  // Checkout Calculations (Multi-Night duration + Restaurant orders)
  const activeRoom = selectedRoomDetails ? rooms.find(r => r.number === selectedRoomDetails.number) : null;
  const nightlyRate = activeRoom ? Number(activeRoom.price) || 1000 : 0;
  
  const checkin = activeRoom?.checkinDate || new Date().toISOString().split("T")[0];
  const checkout = activeRoom?.checkoutDate || checkin;
  const stayNights = activeRoom?.nights || Math.max(1, Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)) || 1);
  const totalRoomTariff = nightlyRate * stayNights;
  
  const roomOrders = activeRoom?.orders || [];
  const ordersTotal = roomOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const grandTotal = totalRoomTariff + ordersTotal;

  const handleProcessCheckout = () => {
    if (!activeRoom) return;

    let finalPaymentMethod = paymentMethod;
    let splitPaymentsData: Array<{ method: string; amount: number }> | undefined = undefined;

    if (paymentMethod === "Split") {
      const a1 = Number(splitAmount1) || 0;
      const a2 = Number(splitAmount2) || 0;
      if (Math.abs((a1 + a2) - grandTotal) > 0.01) {
        toast.error(`Split amounts sum (₹${(a1 + a2).toFixed(2)}) must equal Grand Total (₹${grandTotal.toFixed(2)})!`);
        return;
      }
      finalPaymentMethod = `Split: ${splitMethod1} (₹${a1}) + ${splitMethod2} (₹${a2})`;
      splitPaymentsData = [
        { method: splitMethod1, amount: a1 },
        { method: splitMethod2, amount: a2 }
      ];
    }
    
    // Save invoice details for the printable receipt modal before wiping room state
    const currentInvoice = {
      roomNumber: activeRoom.number,
      guestName: activeRoom.guestName || "Walk-In Guest",
      guestPhone: activeRoom.guestPhone || "N/A",
      idType: activeRoom.idType,
      idNumber: activeRoom.idNumber,
      checkinDate: checkin,
      checkoutDate: activeRoom.checkoutDate,
      nights: stayNights,
      roomRate: totalRoomTariff,
      nightlyRate: nightlyRate,
      completedOrders: roomOrders,
      ordersTotal: ordersTotal,
      grandTotal: grandTotal,
      paymentMethod: finalPaymentMethod,
      splitPayments: splitPaymentsData,
      date: new Date().toLocaleDateString(),
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`
    };
    
    setInvoiceDetails(currentInvoice);

    // Save or update resident guest to the Customers database automatically
    const existingCust = customers.find(c => c.phone === activeRoom.guestPhone);
    if (existingCust) {
      setCustomers(customers.map(c => c.phone === activeRoom.guestPhone ? { ...c, visits: c.visits + 1 } : c));
    } else {
      setCustomers([
        {
          id: `C-${Date.now().toString(36).toUpperCase()}`,
          name: activeRoom.guestName || "Walk-In Guest",
          phone: activeRoom.guestPhone || "N/A",
          email: "N/A",
          visits: 1,
          loyalty: "Bronze"
        },
        ...customers
      ]);
    }
    
    // Save to global invoices database
    const savedInvoice = {
      invoiceNo: currentInvoice.invoiceNo,
      roomNumber: currentInvoice.roomNumber,
      guestName: currentInvoice.guestName,
      guestPhone: currentInvoice.guestPhone,
      idType: currentInvoice.idType,
      idNumber: currentInvoice.idNumber,
      checkinDate: currentInvoice.checkinDate,
      checkoutDate: currentInvoice.checkoutDate,
      nights: currentInvoice.nights,
      roomRate: currentInvoice.roomRate,
      completedOrders: currentInvoice.completedOrders.map((o: any) => ({
        description: o.description,
        amount: o.amount
      })),
      ordersTotal: currentInvoice.ordersTotal,
      grandTotal: currentInvoice.grandTotal,
      paymentMethod: currentInvoice.paymentMethod,
      splitPayments: currentInvoice.splitPayments,
      date: currentInvoice.date
    };
    setInvoices([savedInvoice, ...invoices]);

    // 1. Update Room Status & Clear Folio & Clear Guest Details
    setRooms(rooms.map(r => r.number === activeRoom.number ? { 
      ...r, 
      status: "cleaning", 
      orders: [],
      guestName: undefined,
      guestPhone: undefined,
      guestsCount: undefined,
      idType: undefined,
      idNumber: undefined,
      checkinDate: undefined,
      checkoutDate: undefined,
      nights: undefined
    } : r));
    
    // 2. Log Income to Accounting Ledger
    const newTx = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      description: `Checkout - Room ${activeRoom.number} (${stayNights} Night${stayNights > 1 ? 's' : ''})`,
      type: "Income" as const,
      amount: grandTotal,
      method: finalPaymentMethod,
    };
    setTransactions([newTx, ...transactions]);

    toast.success(`Payment of ₹${grandTotal.toFixed(2)} successful via ${finalPaymentMethod}. Room is now cleaning.`);
    setCheckoutOpen(false);
    setDetailsOpen(false);
    setInvoiceOpen(true); // Open the printable invoice modal!
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "available": return "text-emerald-500 bg-emerald-500/10";
      case "occupied": return "text-rose-500 bg-rose-500/10";
      case "reserved": return "text-indigo-500 bg-indigo-500/10";
      case "cleaning": return "text-amber-500 bg-amber-500/10";
      case "maintenance": return "text-slate-500 bg-slate-500/10";
      default: return "";
    }
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
      


      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[88vh] overflow-y-auto p-6 gap-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold">New Guest Booking</DialogTitle>
            <DialogDescription className="text-xs">Check-in details and guest registration form.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Guest Name *</Label>
                <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Contact Number *</Label>
                <div className="flex gap-2">
                  <Select value={guestCountryCode} onValueChange={setGuestCountryCode}>
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
                    value={guestPhone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setGuestPhone(val);
                    }} 
                    placeholder="9876543210" 
                    type="tel" 
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total Guests *</Label>
                <Select value={guestsCount} onValueChange={setGuestsCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Person</SelectItem>
                    <SelectItem value="2">2 Persons</SelectItem>
                    <SelectItem value="3">3 Persons</SelectItem>
                    <SelectItem value="4">4+ Persons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> ID Proof Type</Label>
                <Select value={idType} onValueChange={setIdType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aadhar">Aadhar Card</SelectItem>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="Driving License">Driving License</SelectItem>
                    <SelectItem value="Voter ID">Voter ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ID Document Number</Label>
                <Input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Enter ID Details" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> Check-in Date *</Label>
                <Input value={checkinDate} onChange={(e) => setCheckinDate(e.target.value)} type="date" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-rose-500" /> Checkout Date *</Label>
                <Input value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} type="date" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Assign Room *</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.filter(r => r.status === "available" || r.status === "cleaning").map((r) => (
                      <SelectItem key={r.number} value={r.number}>
                        Room {r.number} ({r.type || "Standard"} — {r.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Number / ID *</Label>
                <Input value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} placeholder="e.g. 401" />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={newRoomType} onValueChange={setNewRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                    <SelectItem value="Custom">Other (Custom Type)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newRoomType === "Custom" && (
              <div className="space-y-2">
                <Label>Custom Room Type</Label>
                <Input value={customRoomType} onChange={(e) => setCustomRoomType(e.target.value)} placeholder="e.g. Presidential Suite" />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Price / Night (₹)</Label>
                <Input value={newRoomPrice} onChange={(e) => setNewRoomPrice(e.target.value)} placeholder="5000" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input value={newRoomCapacity} onChange={(e) => setNewRoomCapacity(e.target.value)} placeholder="2" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Size (sq ft)</Label>
                <Input value={newRoomSize} onChange={(e) => setNewRoomSize(e.target.value)} placeholder="300" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Bed Type</Label>
                <div className="flex flex-wrap gap-2">
                  {BED_TYPES.map((bedType) => (
                    <button
                      key={bedType}
                      type="button"
                      onClick={() => toggleBedType(bedType)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        newBedTypes.includes(bedType)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      {bedType}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {newBedTypes.includes("Custom") && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label>Custom Bed Type</Label>
                <Input value={customBedType} onChange={(e) => setCustomBedType(e.target.value)} placeholder="e.g. California King" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room View</Label>
                <Select value={newRoomView} onValueChange={setNewRoomView}>
                  <SelectTrigger><SelectValue placeholder="Select view" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="City">City View</SelectItem>
                    <SelectItem value="Garden">Garden View</SelectItem>
                    <SelectItem value="Ocean">Ocean View</SelectItem>
                    <SelectItem value="None">No View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Smoking Policy</Label>
                <Select value={newSmokingPolicy} onValueChange={setNewSmokingPolicy}>
                  <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non-Smoking">Non-Smoking</SelectItem>
                    <SelectItem value="Smoking">Smoking Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map(am => (
                  <button
                    key={am}
                    type="button"
                    onClick={() => toggleAmenity(am)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      newAmenities.includes(am) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {am}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRoom}>Add Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[88vh] overflow-y-auto p-6 gap-5">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                  {activeRoom?.number}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Room {activeRoom?.number} Console</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeRoom?.type || "Standard"} Suite · Floor {activeRoom?.number?.charAt(0) || "1"}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(activeRoom?.status)}`}>
                {activeRoom?.status}
              </span>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            {/* Active Booking Guest Card */}
            {activeRoom?.status === "occupied" && activeRoom.guestName && (
              <div className="bg-card/70 dark:bg-muted/20 p-4 rounded-xl border border-border/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-xs uppercase font-bold text-foreground tracking-wider">Active Guest Folio</span>
                  </div>
                  <span className="text-[11px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">
                    {activeRoom.guestsCount || "1"} Guest(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Guest Name</span>
                    <p className="font-semibold text-sm text-foreground">{activeRoom.guestName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Contact Number</span>
                    <p className="font-semibold text-sm text-foreground font-mono">{activeRoom.guestPhone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Expected Checkout</span>
                    <p className="font-semibold text-rose-500 font-mono">{activeRoom.checkoutDate}</p>
                  </div>
                  {activeRoom.idNumber && (
                    <div>
                      <span className="text-muted-foreground block mb-0.5">{activeRoom.idType || "ID Proof"}</span>
                      <p className="font-semibold text-foreground font-mono truncate">{activeRoom.idNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Restaurant Orders Folio */}
            {activeRoom?.status === "occupied" && activeRoom.orders && activeRoom.orders.length > 0 && (
              <div className="bg-card/70 dark:bg-muted/20 p-4 rounded-xl border border-border/80 shadow-xs space-y-3">
                <div className="flex justify-between items-center border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs uppercase font-bold text-foreground tracking-wider">Restaurant & Bar Charges</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border border-emerald-500/20">
                    <span>Total:</span>
                    <span>₹{ordersTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 divide-y divide-border/40">
                  {activeRoom.orders.map((ord, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs pt-1.5 first:pt-0">
                      <div className="flex-1 pr-3">
                        <p className="font-medium text-foreground">{ord.description}</p>
                        {ord.time && <span className="text-[10px] text-muted-foreground font-mono">{new Date(ord.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                      <span className="font-mono font-semibold text-foreground shrink-0">₹{ord.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Specifications & Parameters */}
            <div className="bg-muted/20 p-4 rounded-xl border border-border/60 space-y-3">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block">Room Specifications</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-background border">
                  <span className="text-muted-foreground block text-[11px]">Tariff / Night</span>
                  <span className="font-bold text-sm text-primary font-mono">₹{activeRoom?.price || "1000"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border">
                  <span className="text-muted-foreground block text-[11px]">Room Type</span>
                  <span className="font-semibold text-foreground">{activeRoom?.type || "Standard"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border">
                  <span className="text-muted-foreground block text-[11px]">Capacity</span>
                  <span className="font-semibold text-foreground">{activeRoom?.capacity || "2"} Persons</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border">
                  <span className="text-muted-foreground block text-[11px]">Bed Configuration</span>
                  <span className="font-semibold text-foreground">{activeRoom?.bedType || "Queen"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border">
                  <span className="text-muted-foreground block text-[11px]">Room Size</span>
                  <span className="font-semibold text-foreground">{activeRoom?.size || "300"} sq ft</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border">
                  <span className="text-muted-foreground block text-[11px]">View & Policy</span>
                  <span className="font-semibold text-foreground">{activeRoom?.view || "City"} · {activeRoom?.smoking || "Non-Smoking"}</span>
                </div>
              </div>

              {/* Amenities */}
              {activeRoom?.amenities && activeRoom.amenities.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-muted-foreground block mb-1.5">Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRoom.amenities.map((am: string) => (
                      <span key={am} className="bg-background px-2.5 py-1 rounded-md text-[11px] font-medium border text-muted-foreground">
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* In-Room QR Dining Launcher & Standee Printer */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                  <QrCode className="size-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">In-Room Dining QR Menu</span>
                  <span className="text-[11px] text-muted-foreground">Print tent card or open guest ordering portal</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => {
                    if (activeRoom?.number) {
                      setSelectedQrRoom(activeRoom.number);
                      setQrModalOpen(true);
                    }
                  }}
                >
                  <Printer className="size-3" /> Print Standee
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    window.open(`/guest/room/${activeRoom?.number}`, "_blank");
                  }}
                >
                  <ExternalLink className="size-3" /> Test Order
                </Button>
              </div>
            </div>

            {/* Quick Status Update */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-card border">
              <span className="text-xs font-medium text-foreground">Change Room Status</span>
              <div className="w-[180px]">
                <Select value={activeRoom?.status} onValueChange={(value) => handleStatusUpdate(value as RoomData["status"])}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center w-full gap-3 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={handleDeleteRoom} className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 gap-1.5 w-full sm:w-auto">
              <Trash2 className="w-3.5 h-3.5" /> Delete Room
            </Button>
            <div className="flex gap-2 justify-end w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => setDetailsOpen(false)}>Close</Button>
              
              {activeRoom?.status === "cleaning" && (
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleMarkCleaned}>
                  <Sparkles className="w-3.5 h-3.5" /> Mark Cleaned
                </Button>
              )}
              
              {activeRoom?.status === "occupied" && (
                <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground shadow-sm hover:opacity-90" onClick={() => { setDetailsOpen(false); setCheckoutOpen(true); }}>
                  <Receipt className="w-3.5 h-3.5" /> Checkout & Bill
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout & Bill Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[88vh] overflow-y-auto p-6 gap-5">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Checkout & Settle Bill</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Room {activeRoom?.number} · Guest: {activeRoom?.guestName || "Walk-In Guest"}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="bg-card/70 dark:bg-muted/20 p-4 rounded-xl border border-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block border-b pb-2">
                Itemized Folio Summary
              </span>
              
              {/* Room Rent (Multi-Night Calculation) */}
              <div className="flex justify-between items-center text-sm py-1">
                <div>
                  <span className="font-medium text-foreground block">Room Tariff ({stayNights} Night{stayNights > 1 ? 's' : ''})</span>
                  <span className="text-[11px] text-muted-foreground font-mono">₹{nightlyRate} / night × {stayNights} night{stayNights > 1 ? 's' : ''}</span>
                </div>
                <span className="font-mono font-semibold text-foreground">₹{totalRoomTariff.toFixed(2)}</span>
              </div>
              
              {/* Restaurant Orders */}
              {roomOrders.length > 0 && (
                <div className="space-y-2 border-t pt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ChefHat className="w-3.5 h-3.5 text-primary" /> Restaurant & Bar Charges
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">₹{ordersTotal.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1.5 pl-2 max-h-36 overflow-y-auto">
                    {roomOrders.map((order, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs text-muted-foreground">
                        <span className="pr-3 leading-relaxed">{order.description}</span>
                        <span className="font-mono font-medium shrink-0">₹{order.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-3 border-t border-dashed">
                <div>
                  <span className="font-bold text-base text-foreground block">Grand Total Due</span>
                  <span className="text-[11px] text-muted-foreground">Includes {stayNights} night(s) tariff & all orders</span>
                </div>
                <span className="text-2xl font-bold font-mono text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold">Payment Settlement Method</Label>
              <Select value={paymentMethod} onValueChange={(val) => {
                setPaymentMethod(val);
                if (val === "Split") {
                  const half = Math.floor(grandTotal / 2);
                  setSplitAmount1(half.toString());
                  setSplitAmount2((grandTotal - half).toFixed(2));
                }
              }}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">💳 Credit / Debit Card</SelectItem>
                  <SelectItem value="Cash">💵 Cash</SelectItem>
                  <SelectItem value="UPI">📱 UPI / QR Scan</SelectItem>
                  <SelectItem value="Bank Transfer">🏦 Bank Transfer</SelectItem>
                  <SelectItem value="Split">✂️ Split Payment (Dual Mode)</SelectItem>
                </SelectContent>
              </Select>

              {/* Split Payment Controls */}
              {paymentMethod === "Split" && (
                <div className="bg-muted/30 p-3.5 rounded-xl border border-primary/20 space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Split Billing Breakdown</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-6 text-[10px] px-2"
                      onClick={() => {
                        const half = (grandTotal / 2).toFixed(2);
                        setSplitAmount1(half);
                        setSplitAmount2((grandTotal - Number(half)).toFixed(2));
                      }}
                    >
                      50 / 50 Split
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Method 1</Label>
                      <Select value={splitMethod1} onValueChange={setSplitMethod1}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Credit Card">Card</SelectItem>
                          <SelectItem value="Bank Transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        placeholder="Amount" 
                        type="number" 
                        value={splitAmount1} 
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setSplitAmount1(e.target.value);
                          setSplitAmount2(Math.max(0, grandTotal - val).toFixed(2));
                        }} 
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Method 2</Label>
                      <Select value={splitMethod2} onValueChange={setSplitMethod2}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Credit Card">Card</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Bank Transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        placeholder="Amount" 
                        type="number" 
                        value={splitAmount2} 
                        onChange={(e) => setSplitAmount2(e.target.value)} 
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t">
                    <span>Allocated: ₹{((Number(splitAmount1) || 0) + (Number(splitAmount2) || 0)).toFixed(2)}</span>
                    <span className={Math.abs(((Number(splitAmount1) || 0) + (Number(splitAmount2) || 0)) - grandTotal) < 0.01 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                      Remaining: ₹{(grandTotal - ((Number(splitAmount1) || 0) + (Number(splitAmount2) || 0))).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* UPI Free Dynamic QR Code payments */}
            {paymentMethod === "UPI" && (
              <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-muted/30 space-y-2.5 animate-in fade-in">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dynamic Payment QR Code (UPI)</p>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `upi://pay?pa=gokie210402@okaxis&pn=StayBite Residency&am=${grandTotal.toFixed(2)}&cu=INR&tn=Room ${activeRoom?.number} Bill`
                  )}`} 
                  alt="UPI QR Code" 
                  className="w-36 h-36 border p-2 bg-white rounded-xl shadow-xs"
                />
                <span className="text-[11px] text-muted-foreground text-center max-w-[280px]">
                  Scan using GPay, PhonePe, or Paytm. Zero processing charges apply.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button className="gap-2 bg-primary text-primary-foreground font-semibold" onClick={handleProcessCheckout}>
              <CreditCard className="w-4 h-4" /> Process Settlement (₹{grandTotal.toFixed(2)})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Receipt Modal */}
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
                <span className="font-semibold font-mono text-zinc-900">{invoiceDetails?.invoiceNo}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block">Date:</span>
                <span className="font-semibold text-zinc-900">{invoiceDetails?.date}</span>
              </div>
              <div className="mt-1">
                <span className="text-zinc-500 block">Guest Name:</span>
                <span className="font-semibold text-zinc-900">{invoiceDetails?.guestName}</span>
              </div>
              <div className="text-right mt-1">
                <span className="text-zinc-500 block">Room Charged:</span>
                <span className="font-semibold text-zinc-900">Room {invoiceDetails?.roomNumber}</span>
              </div>
              {invoiceDetails?.guestPhone && (
                <div className="mt-1 col-span-2">
                  <span className="text-zinc-500">Phone: </span>
                  <span className="font-semibold text-zinc-900">{invoiceDetails.guestPhone}</span>
                </div>
              )}
            </div>

            {/* Itemized charges */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Itemized Billing Description</span>
              <div className="space-y-2 text-xs text-zinc-800">
                <div className="flex justify-between items-center py-1">
                  <div>
                    <span>Room Tariff ({invoiceDetails?.nights || 1} Night{(invoiceDetails?.nights || 1) > 1 ? 's' : ''})</span>
                    {invoiceDetails?.nightlyRate && (
                      <span className="text-[10px] text-zinc-500 block font-mono">@ ₹{invoiceDetails.nightlyRate} / night</span>
                    )}
                  </div>
                  <span className="font-semibold font-mono">₹{invoiceDetails?.roomRate?.toFixed(2)}</span>
                </div>
                
                {invoiceDetails?.completedOrders?.length > 0 && (
                  <div className="border-t pt-2 space-y-1.5">
                    <span className="text-[10px] text-zinc-500 font-medium uppercase">Restaurant & Bar Charges</span>
                    {invoiceDetails.completedOrders.map((ord: any, i: number) => (
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
                <span className="font-mono">₹{((invoiceDetails?.roomRate || 0) + (invoiceDetails?.ordersTotal || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>CGST / SGST (Included)</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-2 text-zinc-900">
                <span>Grand Total Paid</span>
                <span className="font-mono text-zinc-900">₹{invoiceDetails?.grandTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>Settled Via:</span>
                <span className="font-bold text-zinc-700">{invoiceDetails?.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-zinc-500 pt-2 border-t">
              <p>Thank you for choosing StayBite Residency!</p>
              <p className="italic">Please visit us again.</p>
            </div>
          </div>
          
          {/* Action buttons (Hidden during printing) */}
          <div className="p-4 bg-zinc-100 border-t flex gap-2 justify-end no-print">
            {settings?.whatsappApiKey && (
              <Button size="sm" variant="outline" className="gap-1.5 border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700" onClick={() => toast.success("WhatsApp Invoice Sent to " + invoiceDetails?.guestPhone)}>
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(false)}>
              Close
            </Button>
            <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => printElement("print-area", `Invoice - ${invoiceDetails?.invoiceNo || "Receipt"}`)}>
              <Printer className="w-3.5 h-3.5" /> Print Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room QR Standee & Menu Cards Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-[560px] max-h-[92vh] overflow-y-auto p-0 ring-1 ring-border shadow-2xl rounded-2xl">
          <div className="p-4 border-b bg-muted/40 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <QrCode className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold">Room QR Dining Standee Cards</DialogTitle>
                <p className="text-[11px] text-muted-foreground">Print tent cards for hotel guest rooms</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedQrRoom} onValueChange={setSelectedQrRoom}>
                <SelectTrigger className="h-8 text-xs w-36">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms (Batch)</SelectItem>
                  {rooms.map(r => (
                    <SelectItem key={r.number} value={r.number}>Room {r.number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Printable Standee Area */}
          <div id="standee-print-area" className="p-6 bg-white text-zinc-950 space-y-6">
            {(selectedQrRoom === "all" ? rooms : rooms.filter(r => r.number === selectedQrRoom)).map((r) => {
              const guestUrl = typeof window !== "undefined" 
                ? `${window.location.origin}/guest/room/${r.number}` 
                : `http://localhost:5174/guest/room/${r.number}`;
              
              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(guestUrl)}`;

              return (
                <div key={r.number} className="border-2 border-zinc-800 rounded-3xl p-6 text-center space-y-4 max-w-[360px] mx-auto shadow-sm bg-gradient-to-b from-zinc-50 to-white page-break-after">
                  {/* Hotel Header */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center justify-center size-10 rounded-2xl bg-zinc-900 text-white mb-1">
                      <Hotel className="size-5 text-amber-400" />
                    </div>
                    <h3 className="font-serif text-lg font-bold tracking-tight text-zinc-900 uppercase">StayBite Residency</h3>
                    <p className="text-[10px] tracking-widest uppercase font-mono text-zinc-500 font-semibold">Luxury Hospitality & Dining</p>
                  </div>

                  {/* Room Number Pill */}
                  <div className="py-1">
                    <span className="inline-block bg-zinc-900 text-white font-mono font-bold text-sm px-4 py-1.5 rounded-full tracking-wider shadow-xs">
                      ROOM {r.number}
                    </span>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white border-2 border-dashed border-zinc-300 rounded-2xl shadow-xs">
                    <img 
                      src={qrImageUrl} 
                      alt={`QR Code for Room ${r.number}`} 
                      className="size-44 object-contain rounded-lg"
                    />
                    <span className="text-[10px] font-mono font-bold text-zinc-400 mt-1.5 uppercase">
                      /guest/room/{r.number}
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1 pt-1">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                      📱 24/7 In-Room Dining & Room Service
                    </h4>
                    <p className="text-[11px] text-zinc-600 leading-snug">
                      1. Open your phone camera & scan QR<br />
                      2. Browse digital menu & select dishes<br />
                      3. Order directly to your room folio
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 text-[9px] text-zinc-400 font-mono">
                    StayBite Smart Suite · No App Install Needed
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Action Buttons */}
          <div className="p-4 bg-zinc-100 border-t flex flex-wrap gap-2 justify-between items-center no-print">
            {selectedQrRoom !== "all" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-primary border-primary/30"
                onClick={() => {
                  window.open(`/guest/room/${selectedQrRoom}`, "_blank");
                }}
              >
                <ExternalLink className="size-3" /> Test Order Screen (Room {selectedQrRoom})
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => setQrModalOpen(false)}>
                Close
              </Button>
              <Button size="sm" className="gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white" onClick={() => printElement("standee-print-area", "StayBite Room QR Standees")}>
                <Printer className="size-3.5" /> Print Standees
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Rooms & Bookings"
        description={`${rooms.length} rooms total`}
        actions={
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10" onClick={() => { setSelectedQrRoom("all"); setQrModalOpen(true); }}>
              <QrCode className="size-3.5" /> QR Standees
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => setRoomOpen(true)}>
              <Hotel className="size-3.5" /> Add Room
            </Button>
            <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => setBookingOpen(true)}>
              <Plus className="size-3.5" /> New Booking
            </Button>
          </div>
        }
      />

      {/* Room Status & Housekeeping Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 my-3 hide-scrollbar">
        {[
          { id: "all", label: `All (${rooms.length})` },
          { id: "occupied", label: `Occupied (${rooms.filter(r => r.status === "occupied").length})` },
          { id: "available", label: `Available (${rooms.filter(r => r.status === "available").length})` },
          { id: "cleaning", label: `🧹 Cleaning (${rooms.filter(r => r.status === "cleaning").length})` },
          { id: "reserved", label: `Reserved (${rooms.filter(r => r.status === "reserved").length})` },
          { id: "maintenance", label: `Maintenance (${rooms.filter(r => r.status === "maintenance").length})` },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={statusFilter === tab.id ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs h-7 sm:h-8 px-3 shrink-0"
            onClick={() => setStatusFilter(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-3 sm:p-5">
        <RoomStatusGrid 
          rooms={statusFilter === "all" ? rooms : rooms.filter(r => r.status === statusFilter)} 
          onRoomClick={handleRoomClick} 
        />
      </div>
    </div>
  );
}
