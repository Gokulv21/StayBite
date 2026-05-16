import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff — Arbor ERP" }] }),
  component: () => (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Staff" description="Employees, shifts, attendance and payroll." />
      <Stub />
    </div>
  ),
});

function Stub() {
  return (
    <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-12 text-center">
      <h3 className="text-base font-semibold">Staff management — coming in Phase 2</h3>
    </div>
  );
}
