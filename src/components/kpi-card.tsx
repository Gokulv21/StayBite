import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number; // percentage, signed
  hint?: string;
}

export function KpiCard({ label, value, delta, hint }: KpiCardProps) {
  const trend = delta == null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  return (
    <div className="bg-card rounded-xl p-5 ring-1 ring-border shadow-soft">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mt-1.5">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {delta != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-mono",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              trend === "flat" && "text-muted-foreground",
            )}
          >
            <Icon className="size-3" />
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground mt-2">{hint}</p>}
    </div>
  );
}
