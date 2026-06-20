import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApps } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/printing-center")({
  head: () => ({ meta: [{ title: "Printing Center" }] }),
  component: Print,
});

function Print() {
  const { birth, nationalId, markPrinted } = useApps();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<{ kind: "birth" | "nationalId"; id: string } | null>(null);

  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    const ql = q.toLowerCase();
    const bx = birth.filter((a) => a.status === "Approved" &&
      (a.applicantName.toLowerCase().includes(ql) || a.applicationNumber.toLowerCase().includes(ql)))
      .map((a) => ({ ...a, kind: "birth" as const }));
    const nx = nationalId.filter((a) => a.status === "Approved" &&
      (a.applicantName.toLowerCase().includes(ql) || a.applicationNumber.toLowerCase().includes(ql) ||
        // national ID search
        false))
      .map((a) => ({ ...a, kind: "nationalId" as const }));
    return [...bx, ...nx];
  }, [q, birth, nationalId]);

  return (
    <div>
      <PageHeader title="Printing Center" description="Look up an approved application and print documents for collection." />

      <div className="rounded-xl border border-border bg-gradient-to-br from-gov to-[oklch(0.22_0.08_260)] p-6 text-gov-foreground shadow-md">
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Search className="h-4 w-4" /> Search Approved Applications
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by application number, name, or National ID"
            className="h-12 max-w-xl bg-white/95 text-foreground"
          />
          <Button className="h-12 bg-gold text-gold-foreground hover:bg-gold/90">Search</Button>
        </div>
        <p className="mt-2 text-xs opacity-80">Tip: start typing at least 2 characters.</p>
      </div>

      <div className="mt-6 space-y-3">
        {q.trim().length < 2 ? (
          <EmptyState icon={Search} title="Search to begin" description="Find a citizen's approved application to print their document." />
        ) : results.length === 0 ? (
          <EmptyState icon={Printer} title="No matches found" description="Verify the application number or applicant name." />
        ) : (
          results.map((a) => (
            <div key={`${a.kind}-${a.id}`} className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{a.applicationNumber}</p>
                <p className="truncate font-display text-lg font-bold">{a.applicantName}</p>
                <p className="text-xs text-muted-foreground">
                  {a.kind === "birth" ? "Birth Certificate" : "National ID"} · Approved {a.approvedAt ? format(new Date(a.approvedAt), "dd MMM yyyy") : "—"}
                </p>
                <div className="mt-2 flex gap-2">
                  <StatusBadge status={a.status} />
                  <StatusBadge status={a.printStatus ?? "Not Printed"} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print {a.kind === "birth" ? "Certificate" : "Summary"}
                </Button>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                  disabled={a.printStatus === "Printed"}
                  onClick={() => setConfirmId({ kind: a.kind, id: a.id })}
                >
                  Mark as Printed
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={!!confirmId}
        onOpenChange={(v) => { if (!v) setConfirmId(null); }}
        title="Mark this application as printed?"
        description="This will move the application out of the active print queue."
        confirmLabel="Yes, mark printed"
        tone="success"
        onConfirm={() => {
          if (confirmId) {
            markPrinted(confirmId.kind, confirmId.id);
            toast.success("Updated");
          }
        }}
      />
    </div>
  );
}
