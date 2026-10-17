// Cloudflare Pages & Workers D1 Serverless API Gateway for StayBite

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, "") || "/";
  const method = request.method;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Abuse Protection: Request Body Size Clamping (Max 250 KB)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 250 * 1024) {
    return Response.json({ error: "Payload too large. Max allowed is 250 KB." }, { status: 413, headers: corsHeaders });
  }

  try {
    // 2. Health check
    if (path === "/" || path === "/health") {
      return Response.json({ 
        status: "online", 
        engine: "Cloudflare D1 Serverless", 
        timestamp: new Date().toISOString() 
      }, { headers: corsHeaders });
    }

    // 3. Rooms API
    if (path.startsWith("/rooms")) {
      if (method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM rooms ORDER BY number ASC").all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (method === "POST") {
        const body: any = await request.json();
        if (body.action === "updateStatus") {
          const validStatuses = ["available", "occupied", "cleaning", "maintenance", "reserved"];
          if (!validStatuses.includes(body.status)) {
            return Response.json({ error: "Invalid status" }, { status: 400, headers: corsHeaders });
          }

          await env.DB.prepare("UPDATE rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE number = ?")
            .bind(String(body.status).slice(0, 20), String(body.roomNumber).slice(0, 10))
            .run();
          return Response.json({ success: true }, { headers: corsHeaders });
        }

        if (body.action === "book") {
          const roomNum = String(body.roomNumber).slice(0, 10);
          const gName = String(body.guestName).slice(0, 100);
          const gPhone = String(body.guestPhone).slice(0, 20);

          await env.DB.prepare(`
            UPDATE rooms 
            SET status = 'occupied', guest_name = ?, guest_phone = ?, guests_count = ?, id_type = ?, id_number = ?, checkin_date = ?, checkout_date = ?, nights = ?, updated_at = CURRENT_TIMESTAMP
            WHERE number = ?
          `).bind(
            gName, gPhone, String(body.guestsCount || "1").slice(0, 5), String(body.idType || "Aadhar").slice(0, 30), String(body.idNumber || "").slice(0, 50), String(body.checkinDate || "").slice(0, 20), String(body.checkoutDate || "").slice(0, 20), Number(body.nights) || 1, roomNum
          ).run();
          return Response.json({ success: true }, { headers: corsHeaders });
        }
      }
    }

    // 4. KDS Kitchen Tickets API
    if (path.startsWith("/kds")) {
      if (method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM kds_tickets WHERE status = 'pending' ORDER BY created_at ASC").all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (method === "POST") {
        const body: any = await request.json();
        const ticketId = String(body.id || `T-${Date.now()}`).slice(0, 20);
        const tbl = String(body.table || "Walk-In").slice(0, 20);

        await env.DB.prepare(`
          INSERT INTO kds_tickets (id, table_name, items, elapsed, urgent, status)
          VALUES (?, ?, ?, ?, ?, 'pending')
        `).bind(ticketId, tbl, JSON.stringify(body.items || []), 0, body.urgent ? 1 : 0).run();

        return Response.json({ success: true, ticketId }, { headers: corsHeaders });
      }
    }

    // 5. Menu Items API
    if (path.startsWith("/menu")) {
      if (method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM menu_items WHERE is_available = 1").all();
        return Response.json(results, { headers: corsHeaders });
      }
    }

    // 6. Invoices API
    if (path.startsWith("/invoices")) {
      if (method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM invoices ORDER BY created_at DESC LIMIT 100").all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (method === "POST") {
        const inv: any = await request.json();
        const invNo = String(inv.invoiceNo || `INV-${Date.now()}`).slice(0, 30);
        
        await env.DB.prepare(`
          INSERT INTO invoices (invoice_no, room_number, guest_name, guest_phone, checkin_date, checkout_date, nights, room_rate, orders_total, grand_total, payment_method, split_payments, date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          invNo, String(inv.roomNumber).slice(0, 10), String(inv.guestName).slice(0, 100), String(inv.guestPhone || "").slice(0, 20), String(inv.checkinDate || "").slice(0, 20), String(inv.checkoutDate || "").slice(0, 20), Number(inv.nights) || 1, Number(inv.roomRate) || 0, Number(inv.ordersTotal) || 0, Number(inv.grandTotal) || 0, String(inv.paymentMethod || "Cash").slice(0, 100), JSON.stringify(inv.splitPayments || []), String(inv.date || "").slice(0, 30)
        ).run();

        return Response.json({ success: true, invoiceNo: invNo }, { headers: corsHeaders });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
};
