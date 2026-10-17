// Cloudflare D1 Real-Time Sync Service for StayBite

export const CloudflareD1Service = {
  // Check Cloudflare D1 connection status
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch("/api/health");
      return res.ok;
    } catch {
      return false;
    }
  },

  // Pull rooms from Cloudflare D1
  async fetchRooms() {
    try {
      const res = await fetch("/api/rooms");
      if (!res.ok) throw new Error("Failed to fetch rooms from D1");
      return await res.json();
    } catch (e) {
      console.warn("Cloudflare D1 offline, using local store:", e);
      return null;
    }
  },

  // Push booking to Cloudflare D1
  async saveBooking(bookingData: {
    roomNumber: string;
    guestName: string;
    guestPhone: string;
    guestsCount: string;
    idType: string;
    idNumber: string;
    checkinDate: string;
    checkoutDate: string;
    nights: number;
  }) {
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "book", ...bookingData }),
      });
      return res.ok;
    } catch (e) {
      console.warn("D1 booking sync error:", e);
      return false;
    }
  },

  // Push invoice to Cloudflare D1
  async saveInvoice(invoiceData: any) {
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      return res.ok;
    } catch (e) {
      console.warn("D1 invoice sync error:", e);
      return false;
    }
  },

  // Push KDS ticket to Cloudflare D1
  async dispatchKdsTicket(ticket: { id: string; table: string; items: string[]; urgent?: boolean }) {
    try {
      const res = await fetch("/api/kds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      });
      return res.ok;
    } catch (e) {
      console.warn("D1 ticket dispatch error:", e);
      return false;
    }
  },
};
