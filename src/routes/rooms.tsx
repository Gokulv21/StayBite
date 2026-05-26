import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RoomStatusGrid } from "@/components/room-status-grid";
import { Button } from "@/components/ui/button";
import { Plus, Hotel, Trash2, Receipt, CreditCard, Sparkles, User, Phone, Users, FileText, Calendar, Printer, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataStore, RoomData } from "@/stores/data-store";

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
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<RoomData | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  // Booking form states
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCountryCode, setGuestCountryCode] = useState("+91");
  const [guestsCount, setGuestsCount] = useState("1");
  const [idType, setIdType] = useState("Aadhar");
  const [idNumber, setIdNumber] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

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
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

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

    setRooms(rooms.map(r => r.number === selectedRoom ? { 
      ...r, 
      status: "occupied",
      guestName,
      guestPhone: `${guestCountryCode} ${guestPhone}`,
      guestsCount,
      idType,
      idNumber,
      checkoutDate
    } : r));
    toast.success(`Booking confirmed for ${guestName} in Room ${selectedRoom}!`);
    setBookingOpen(false);
    setGuestName("");
    setGuestPhone("");
    setGuestCountryCode("+91");
    setGuestsCount("1");
    setIdType("Aadhar");
    setIdNumber("");
    setCheckoutDate("");
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

  // Checkout Calculations
  const roomRate = selectedRoomDetails ? Number(selectedRoomDetails.price) || 0 : 0;
  // Make sure to find the fresh room data from store to get the latest orders
  const activeRoom = selectedRoomDetails ? rooms.find(r => r.number === selectedRoomDetails.number) : null;
  const roomOrders = activeRoom?.orders || [];
  
  // Sum only restaurant orders marked as COMPLETED by the Kitchen KDS terminal
  const completedOrders = roomOrders.filter(o => o.status === "completed");
  const ordersTotal = completedOrders.reduce((sum, o) => sum + o.amount, 0);
  const grandTotal = roomRate + ordersTotal;

  const handleProcessCheckout = () => {
    if (!activeRoom) return;
    
    // Save invoice details for the printable receipt modal before wiping room state
    const currentInvoice = {
      roomNumber: activeRoom.number,
      guestName: activeRoom.guestName || "Walk-In Guest",
      guestPhone: activeRoom.guestPhone || "N/A",
      idType: activeRoom.idType,
      idNumber: activeRoom.idNumber,
      checkoutDate: activeRoom.checkoutDate,
      roomRate: roomRate,
      completedOrders: completedOrders,
      ordersTotal: ordersTotal,
      grandTotal: grandTotal,
      paymentMethod: paymentMethod,
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
          id: `C-00${customers.length + 1}`,
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
      checkoutDate: currentInvoice.checkoutDate,
      roomRate: currentInvoice.roomRate,
      completedOrders: currentInvoice.completedOrders.map((o: any) => ({
        description: o.description,
        amount: o.amount
      })),
      ordersTotal: currentInvoice.ordersTotal,
      grandTotal: currentInvoice.grandTotal,
      paymentMethod: currentInvoice.paymentMethod,
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
      checkoutDate: undefined
    } : r));
    
    // 2. Log Income to Accounting Ledger
    const newTx = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      description: `Checkout - Room ${activeRoom.number}`,
      type: "Income" as const,
      amount: grandTotal,
      method: paymentMethod,
    };
    setTransactions([newTx, ...transactions]);

    toast.success(`Payment of ₹${grandTotal.toFixed(2)} successful. Room is now cleaning.`);
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
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      


      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Guest Booking</DialogTitle>
            <DialogDescription>Check-in details and guest registration form.</DialogDescription>
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
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Checkout Date *</Label>
                <Input value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} type="date" />
              </div>
              <div className="space-y-2">
                <Label>Assign Room *</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.filter(r => r.status === "available" || r.status === "cleaning").map((r) => (
                      <SelectItem key={r.number} value={r.number}>
                        Room {r.number} ({r.status})
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Room {activeRoom?.number} Console</DialogTitle>
            <DialogDescription className="flex items-center gap-1.5 mt-1.5">
              Current Status: 
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(activeRoom?.status)}`}>
                {activeRoom?.status}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 text-sm">
            
            {/* Active Booking Guest Card */}
            {activeRoom?.status === "occupied" && activeRoom.guestName && (
              <div className="bg-muted/40 p-4 rounded-xl border space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Active Guest Information</Label>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1.5">
                  <div>
                    <span className="text-muted-foreground">Guest Name:</span>
                    <p className="font-semibold text-sm">{activeRoom.guestName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <p className="font-semibold text-sm">{activeRoom.guestPhone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">No. of Guests:</span>
                    <p className="font-semibold">{activeRoom.guestsCount} Person(s)</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Checkout Date:</span>
                    <p className="font-semibold text-rose-500">{activeRoom.checkoutDate}</p>
                  </div>
                  {activeRoom.idNumber && (
                    <div className="col-span-2 border-t pt-1.5 mt-1 flex justify-between">
                      <span className="text-muted-foreground">{activeRoom.idType}:</span>
                      <span className="font-semibold font-mono">{activeRoom.idNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Room Parameters */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="flex flex-col border-b pb-2">
                <span className="text-muted-foreground text-xs">Room Type</span>
                <span className="font-medium">{activeRoom?.type || "Standard"}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="text-muted-foreground text-xs">Price/Night</span>
                <span className="font-medium text-primary">₹{activeRoom?.price || "1000"}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="text-muted-foreground text-xs">Capacity</span>
                <span className="font-medium">{activeRoom?.capacity || "2"} Persons</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="text-muted-foreground text-xs">Bed Type</span>
                <span className="font-medium">{activeRoom?.bedType || "Queen"}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="text-muted-foreground text-xs">Size</span>
                <span className="font-medium">{activeRoom?.size || "300"} sq ft</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="text-muted-foreground text-xs">View</span>
                <span className="font-medium">{activeRoom?.view || "None"}</span>
              </div>
              <div className="flex flex-col border-b pb-2 col-span-2">
                <span className="text-muted-foreground text-xs mb-1">Amenities</span>
                <div className="flex flex-wrap gap-1">
                  {activeRoom?.amenities?.length ? (
                    activeRoom.amenities.map((am: string) => (
                      <span key={am} className="bg-muted px-2 py-0.5 rounded text-[10px]">{am}</span>
                    ))
                  ) : (
                    <span className="text-xs italic text-muted-foreground">No specific amenities listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between items-center w-full gap-2">
            <Button variant="destructive" size="sm" onClick={handleDeleteRoom} className="gap-2 shrink-0">
              <Trash2 className="w-3.5 h-3.5" /> Delete Room
            </Button>
            <div className="flex gap-2 justify-end w-full">
              <Button variant="outline" size="sm" onClick={() => setDetailsOpen(false)}>Close</Button>
              
              {activeRoom?.status === "cleaning" && (
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleMarkCleaned}>
                  <Sparkles className="w-3.5 h-3.5" /> Mark Cleaned
                </Button>
              )}
              
              {activeRoom?.status === "occupied" && (
                <Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { setDetailsOpen(false); setCheckoutOpen(true); }}>
                  <Receipt className="w-3.5 h-3.5" /> Checkout & Bill
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout & Bill Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> Invoice: Room {activeRoom?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-border/50">
                <span className="font-medium">Room Rate (1 Night)</span>
                <span>₹{roomRate.toFixed(2)}</span>
              </div>
              
              {completedOrders.length > 0 ? (
                <div className="space-y-2 mb-2 pb-2 border-b border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurant & Bar (Kitchen Served)</span>
                  {completedOrders.map((order, idx) => (
                    <div key={idx} className="flex justify-between items-start text-muted-foreground text-xs">
                      <span className="w-3/4 pr-2">{order.description}</span>
                      <span>₹{order.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Show warnings if there are pending orders that are NOT yet marked done */}
              {roomOrders.length > completedOrders.length && (
                <div className="text-[10px] text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mb-2">
                  ⚠️ Note: {roomOrders.length - completedOrders.length} restaurant order(s) are still preparation-pending in KDS and are excluded from this checkout bill. Only served/completed dishes are billed.
                </div>
              )}

              <div className="flex justify-between items-center mt-3 pt-2 font-semibold text-base">
                <span>Grand Total</span>
                <span className="text-primary text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI / Digital (QR Scan)</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* UPI Free Dynamic QR Code payments */}
            {paymentMethod === "UPI" && (
              <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-muted/20 space-y-2 mt-3 animate-in fade-in">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dynamic Payment QR Code (Free)</p>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `upi://pay?pa=gokie210402@okaxis&pn=StayBite Residency&am=${grandTotal.toFixed(2)}&cu=INR&tn=Room ${activeRoom?.number} Bill`
                  )}`} 
                  alt="UPI QR Code" 
                  className="w-36 h-36 border p-1 bg-white rounded shadow-sm"
                />
                <span className="text-[10px] text-muted-foreground text-center max-w-[250px]">
                  Scan using GPay, Paytm, or PhonePe. Zero processing charges apply.
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button className="gap-2 bg-primary" onClick={handleProcessCheckout}>
              <CreditCard className="w-4 h-4" /> Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Receipt Modal */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-[450px] p-0 overflow-hidden ring-1 ring-border shadow-2xl">
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
                  <span>Room Tariff Rate (1 Night)</span>
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
            <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" /> Print Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Rooms & Bookings"
        description={`${rooms.length} rooms across all floors`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRoomOpen(true)}>
              <Hotel className="size-3.5" /> Add Room
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setBookingOpen(true)}>
              <Plus className="size-3.5" /> New booking
            </Button>
          </>
        }
      />
      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-6">
        <RoomStatusGrid rooms={rooms} onRoomClick={handleRoomClick} />
      </div>
    </div>
  );
}
