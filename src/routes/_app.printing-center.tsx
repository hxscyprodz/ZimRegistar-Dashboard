import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { EmptyState } from "@/components/common/EmptyState";
import { BirthCertificatePrint } from "@/components/print/BirthCertificatePrint";
import { NationalIdCardPrint } from "@/components/print/NationalIdCardPrint";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import type { BirthCertificateApp, NationalIdApp } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";

type PrintableApp =
  | (BirthCertificateApp & { kind: "birth" })
  | (NationalIdApp & { kind: "nationalId" });

export const Route = createFileRoute("/_app/printing-center")({
  head: () => ({ meta: [{ title: "Printing Center" }] }),
  component: Print,
});

function Print() {
  const { birth, nationalId, markPrinted } = useApps();
  const stationId = useUserStation();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<{ kind: "birth" | "nationalId"; id: string } | null>(
    null,
  );
  const [preview, setPreview] = useState<PrintableApp | null>(null);

  const results = useMemo(() => {
    const ql = q.toLowerCase();
    const matches = (values: Array<string | number | undefined>) =>
      ql.trim() === "" || values.some((value) => value?.toString().toLowerCase().includes(ql));
    const bx = filterByStation(birth, stationId)
      .filter(
        (a) =>
          a.status === "Approved" &&
          a.printStatus !== "Printed" &&
          matches([
            a.firstName,
            a.surname,
            a.applicationId,
            a.mother.nationalIdNumber,
            a.father.nationalIdNumber,
            a.placeOfBirth,
          ]),
      )
      .map((a) => ({ ...a, kind: "birth" as const }));
    const nx = filterByStation(nationalId, stationId)
      .filter(
        (a) =>
          a.status === "Approved" &&
          a.printStatus !== "Printed" &&
          matches([
            a.birthDetails.firstName,
            a.birthDetails.surname,
            a.applicationId,
            a.nationalIdNumber,
          ]),
      )
      .map((a) => ({ ...a, kind: "nationalId" as const }));
    const combined = [...bx, ...nx];
    return combined.map((app) => {
      if (app.kind === "birth") {
        return { ...app, applicantName: `${app.firstName} ${app.surname}` };
      }
      if (app.kind === "nationalId") {
        return {
          ...app,
          applicantName: `${app.birthDetails.firstName} ${app.birthDetails.surname}`,
        };
      }
      return app;
    });
  }, [q, birth, nationalId, stationId]);

  return (
    <div>
      <PageHeader
        title="Printing Center"
        description="Look up an approved application and print documents for collection."
      />

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
        <p className="mt-2 text-xs opacity-80">
          All approved applications are listed below. Use search to narrow the print queue.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {results.length === 0 ? (
          <EmptyState
            icon={Printer}
            title="No matches found"
            description="Verify the application number or applicant name."
          />
        ) : (
          results.map((a) => (
            <div
              key={`${a.kind}-${a._id}`}
              className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{a.applicationId}</p>
                <p className="truncate font-display text-lg font-bold">{a.applicantName}</p>
                <p className="text-xs text-muted-foreground">
                  {a.kind === "birth" ? "Birth Certificate" : "National ID"} · Approved{" "}
                  {a.applicationDate ? format(new Date(a.applicationDate), "dd MMM yyyy") : "—"}
                </p>
                <div className="mt-2 flex gap-2">
                  <StatusBadge status={a.status} />
                  <StatusBadge status={a.printStatus ?? "Not Printed"} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setPreview(a)}>
                  <Printer className="mr-2 h-4 w-4" /> Preview & Print{" "}
                  {a.kind === "birth" ? "Certificate" : "ID Card"}
                </Button>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                  disabled={a.printStatus === "Printed"}
                  onClick={() => setConfirmId({ kind: a.kind, id: a._id })}
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
        onOpenChange={(v) => {
          if (!v) setConfirmId(null);
        }}
        title="Mark this application as printed?"
        description="This will move the application out of the active print queue."
        confirmLabel="Yes, mark printed"
        tone="success"
        onConfirm={() => {
          if (confirmId) {
            markPrinted(confirmId.kind, confirmId.id);
            setConfirmId(null);
            toast.success("Updated");
          }
        }}
      />

      <Dialog
        open={!!preview}
        onOpenChange={(v) => {
          if (!v) setPreview(null);
        }}
      >
        <DialogContent className="print-document-dialog max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {preview?.kind === "birth"
                  ? "Birth Certificate Preview"
                  : "National ID Card Preview"}
              </span>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="print-document-host max-h-[75vh] overflow-auto bg-muted p-6">
            {preview?.kind === "birth" ? <BirthCertificatePrint app={preview} /> : null}
            {preview?.kind === "nationalId" ? <NationalIdCardPrint app={preview} /> : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
