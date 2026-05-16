import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { RoomStatusGrid } from "@/components/room-status-grid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockRooms } from "@/lib/mock-data";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Bookings — Arbor ERP" },
      { name: "description", content: "Live room grid, reservations, check-in and check-out." },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const rooms = mockRooms();
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Rooms & Bookings"
        description={`${rooms.length} rooms across all floors`}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" /> New booking
          </Button>
        }
      />
      <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-6">
        <RoomStatusGrid rooms={rooms} />
      </div>
    </div>
  );
}
