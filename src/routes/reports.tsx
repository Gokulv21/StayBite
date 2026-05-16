import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Arbor ERP" }] }),
  component: () => (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Reports & Analytics" description="Sales, occupancy, P&L, exports." />
      <Stub />
    </div>
  ),
});

function Stub() {
  return (
    <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-12 text-center">
      <h3 className="text-base font-semibold">Reports module — coming in Phase 2</h3>
      <p className="text-sm text-muted-foreground mt-2">
        PDF / Excel / CSV exports across all data domains.
      </p>
    </div>
  );
}
