import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/kds")({
  head: () => ({
    meta: [
      { title: "Kitchen Display — Arbor ERP" },
      { name: "description", content: "Live kitchen order screen with realtime updates." },
    ],
  }),
  component: KdsPage,
});

function KdsPage() {
  const tickets = [
    { id: "T-4920", table: "T-08", items: ["1× Ribeye", "2× House Red"], elapsed: 4, urgent: false },
    { id: "T-4921", table: "T-14", items: ["1× Salmon Tartare", "1× Water"], elapsed: 12, urgent: true },
    { id: "T-4922", table: "Rm 304", items: ["1× Club Sandwich", "1× Espresso"], elapsed: 2, urgent: false },
    { id: "T-4923", table: "T-02", items: ["4× Espresso"], elapsed: 1, urgent: false },
  ];
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Kitchen Display" description="Live order queue · auto-refresh" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl ring-1 shadow-soft overflow-hidden ${
              t.urgent ? "bg-warning/10 ring-warning/30" : "bg-card ring-border"
            }`}
          >
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <span className="font-mono text-xs font-semibold">{t.id}</span>
              <span className="text-[10px] font-medium text-muted-foreground">
                {t.elapsed}m · {t.table}
              </span>
            </div>
            <div className="p-4 space-y-1.5">
              {t.items.map((i) => (
                <p key={i} className="text-sm">{i}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
