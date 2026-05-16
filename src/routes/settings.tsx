import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/stores/session-store";
import { ROLE_LABELS } from "@/lib/rbac";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Arbor ERP" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, branches, activeBranchId } = useSession();
  const branch = branches.find((b) => b.id === activeBranchId);
  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <PageHeader title="Settings" description="Hotel, tax, printer, backup and branch configuration." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Session">
          <Row label="User" value={user?.name ?? "—"} />
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="Role" value={user ? ROLE_LABELS[user.role] : "—"} />
        </Card>
        <Card title="Active branch">
          <Row label="Name" value={branch?.name ?? "—"} />
          <Row label="City" value={branch?.city ?? "—"} />
          <Row label="Branch ID" value={branch?.id ?? "—"} mono />
        </Card>
        <Card title="Tax & currency">
          <Row label="Currency" value="INR (₹)" />
          <Row label="GST" value="18% default" />
        </Card>
        <Card title="System">
          <Row label="Local storage" value="IndexedDB · hotel_pos_local" />
          <Row label="Sync engine" value="Phase 2" />
          <Row label="Printer bridge" value="Phase 2" />
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-border shadow-soft p-5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : "font-medium"}>{value}</span>
    </div>
  );
}
