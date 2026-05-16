import { cn } from "@/lib/utils";

export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance" | "reserved";

interface Room {
  number: string;
  status: RoomStatus;
}

interface RoomStatusGridProps {
  rooms: Room[];
}

const STATUS_STYLES: Record<RoomStatus, string> = {
  available: "bg-success/10 ring-success/20 text-success",
  occupied: "bg-sidebar text-white ring-sidebar",
  cleaning: "bg-warning/15 ring-warning/30 text-warning-foreground",
  maintenance: "bg-destructive/10 ring-destructive/20 text-destructive",
  reserved: "bg-chart-2/10 ring-chart-2/20 text-chart-2",
};

const LEGEND: Array<{ status: RoomStatus; label: string }> = [
  { status: "available", label: "Available" },
  { status: "occupied", label: "Occupied" },
  { status: "reserved", label: "Reserved" },
  { status: "cleaning", label: "Cleaning" },
  { status: "maintenance", label: "Maintenance" },
];

export function RoomStatusGrid({ rooms }: RoomStatusGridProps) {
  return (
    <div>
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2">
        {rooms.map((r) => (
          <button
            key={r.number}
            className={cn(
              "aspect-square rounded-md ring-1 flex items-center justify-center font-mono text-xs font-semibold transition-transform hover:scale-105",
              STATUS_STYLES[r.status],
            )}
            title={`Room ${r.number} · ${r.status}`}
          >
            {r.number}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {LEGEND.map((l) => (
          <div key={l.status} className="flex items-center gap-1.5">
            <div
              className={cn("size-2 rounded-full", STATUS_STYLES[l.status].split(" ")[0])}
            />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
