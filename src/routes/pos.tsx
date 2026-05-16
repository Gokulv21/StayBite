import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "POS Terminal — Arbor ERP" },
      { name: "description", content: "Restaurant point-of-sale: dine-in, takeaway, delivery, room service." },
    ],
  }),
  component: PosPage,
});

function PosPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="POS Terminal"
        description="Dine-in, takeaway, delivery and room-service ordering."
      />
      <ModulePlaceholder name="Restaurant POS" />
    </div>
  );
}

function ModulePlaceholder({ name }: { name: string }) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-12 text-center">
      <div className="mx-auto size-12 rounded-lg bg-muted grid place-items-center mb-4">
        <Construction className="size-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">{name} — coming in Phase 2</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        Foundation, routing and design system are in place. Implementation of this module
        ships in the next phase per the agreed scope.
      </p>
    </div>
  );
}
