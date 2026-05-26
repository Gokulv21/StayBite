import { cn } from "@/lib/utils";

export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance" | "reserved";

interface Room {
  number: string;
  status: RoomStatus;
}

interface RoomStatusGridProps {
  rooms: Room[];
  onRoomClick?: (room: Room) => void;
}

const STATUS_STYLES: Record<RoomStatus, string> = {
  available: "bg-emerald-500/10 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  occupied: "bg-rose-500/10 ring-rose-500/20 text-rose-600 dark:text-rose-400",
  cleaning: "bg-amber-500/10 ring-amber-500/20 text-amber-600 dark:text-amber-400",
  maintenance: "bg-slate-500/10 ring-slate-500/20 text-slate-600 dark:text-slate-400",
  reserved: "bg-indigo-500/10 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400",
};

const LEGEND: Array<{ status: RoomStatus; label: string }> = [
  { status: "available", label: "Available" },
  { status: "occupied", label: "Occupied" },
  { status: "reserved", label: "Reserved" },
  { status: "cleaning", label: "Cleaning" },
  { status: "maintenance", label: "Maintenance" },
];

export function RoomStatusGrid({ rooms, onRoomClick }: RoomStatusGridProps) {
  return (
    <div>
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2">
        {rooms.map((r) => (
          <button
            key={r.number}
            onClick={() => onRoomClick?.(r)}
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
