import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Arbor ERP" }] }),
  component: () => (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Customers" description="Guest profiles, loyalty points and history." />
      <Stub />
    </div>
  ),
});

function Stub() {
  return (
    <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-12 text-center">
      <h3 className="text-base font-semibold">Customer CRM — coming in Phase 2</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Phone lookup, loyalty tiers, rewards and feedback.
      </p>
    </div>
  );
}
