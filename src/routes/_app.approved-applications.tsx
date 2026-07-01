import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BirthCertificatePrint } from "@/components/print/BirthCertificatePrint";
import { NationalIdCardPrint } from "@/components/print/NationalIdCardPrint";
import { useApps } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";
import type { BirthCertificateApp, NationalIdApp, RecoveryApp } from "@/lib/types";

export const Route = createFileRoute("/_app/approved-applications")({
  head: () => ({ meta: [{ title: "Approved Applications" }] }),
  component: Approved,
});

type Kind = "birth" | "nationalId" | "recovery";
type Preview =
  | { kind: "birth"; app: BirthCertificateApp }
  | { kind: "nationalId"; app: NationalIdApp }
  | { kind: "recovery"; app: RecoveryApp };

function Approved() {
  const { birth, nationalId, recovery, markPrinted } = useApps();
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);

  const filter = <T extends { applicantName: string; applicationNumber: string; status: string; printStatus?: string }>(arr: T[]) =>
    arr.filter((a) => a.status === "Approved" && a.printStatus !== "Printed" && (q === "" ||
      a.applicantName.toLowerCase().includes(q.toLowerCase()) ||
      a.applicationNumber.toLowerCase().includes(q.toLowerCase())));

  const aBirth = useMemo(() => filter(birth), [birth, q]);
  const aNid = useMemo(() => filter(nationalId), [nationalId, q]);
  const aRec = useMemo(() => filter(recovery), [recovery, q]);

  const openPreview = (kind: Kind, app: BirthCertificateApp | NationalIdApp | RecoveryApp) => {
    if (kind === "birth") setPreview({ kind, app: app as BirthCertificateApp });
    else if (kind === "nationalId") setPreview({ kind, app: app as NationalIdApp });
    else setPreview({ kind, app: app as RecoveryApp });
  };

  const Table = ({ items, kind, detailBase }: { items: any[]; kind: Kind; detailBase: string }) => (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Application #</th>
              <th className="px-5 py-3 font-medium">Applicant</th>
              <th className="px-5 py-3 font-medium">Approval Date</th>
              <th className="px-5 py-3 font-medium">Print Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{a.applicationNumber}</td>
                <td className="px-5 py-3 font-medium">{a.applicantName}</td>
                <td className="px-5 py-3 text-muted-foreground">{a.approvedAt ? format(new Date(a.approvedAt), "dd MMM yyyy") : "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={a.printStatus ?? "Not Printed"} /></td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link to={detailBase + "/$id"} params={{ id: a.id }}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Button size="sm" onClick={() => openPreview(kind, a)} disabled={a.printStatus === "Printed"}>
                      <Printer className="mr-1.5 h-4 w-4" /> Print
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? <div className="p-6"><EmptyState icon={CheckCircle2} title="No approved applications" /></div> : null}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Approved Applications" description="All approved citizen requests across categories." />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchBar value={q} onChange={setQ} placeholder="Search by name or application #" />
      </div>
      <Tabs defaultValue="birth">
        <TabsList>
          <TabsTrigger value="birth">Birth Certificates ({aBirth.length})</TabsTrigger>
          <TabsTrigger value="nid">National IDs ({aNid.length})</TabsTrigger>
          <TabsTrigger value="rec">Recovery ({aRec.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="birth" className="mt-4"><Table items={aBirth} kind="birth" detailBase="/applications/birth-certificates" /></TabsContent>
        <TabsContent value="nid" className="mt-4"><Table items={aNid} kind="nationalId" detailBase="/applications/national-id" /></TabsContent>
        <TabsContent value="rec" className="mt-4"><Table items={aRec} kind="recovery" detailBase="/applications/document-recovery" /></TabsContent>
      </Tabs>

      <Dialog open={!!preview} onOpenChange={(v) => { if (!v) setPreview(null); }}>
        <DialogContent className="print-document-dialog max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {preview?.kind === "birth" ? "Birth Certificate Preview" :
                 preview?.kind === "nationalId" ? "National ID Card Preview" :
                 "Recovery Slip Preview"}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                  onClick={() => {
                    if (!preview) return;
                    markPrinted(preview.kind, preview.app.id);
                    setPreview(null);
                    toast.success("Marked as printed");
                  }}
                >
                  Mark as Printed
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="print-document-host max-h-[75vh] overflow-auto bg-muted p-6">
            {preview?.kind === "birth" ? <BirthCertificatePrint app={preview.app} /> : null}
            {preview?.kind === "nationalId" ? <NationalIdCardPrint app={preview.app} /> : null}
            {preview?.kind === "recovery" ? <RecoverySlip app={preview.app} /> : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecoverySlip({ app }: { app: RecoveryApp }) {
  return (
    <div className="mx-auto w-full max-w-3xl bg-white p-10 text-sm text-black shadow-lg">
      <div className="border-b-2 border-[#0A3D91] pb-3">
        <p className="text-xs uppercase tracking-widest text-[#0A3D91]">Republic of Zimbabwe</p>
        <h2 className="font-display text-2xl font-bold text-[#0A3D91]">Document Recovery Collection Slip</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <p><strong>Application #:</strong> {app.applicationNumber}</p>
        <p><strong>Document:</strong> {app.documentType}</p>
        <p><strong>Applicant:</strong> {app.applicant.firstName} {app.applicant.lastName}</p>
        <p><strong>National ID:</strong> {app.applicant.nationalId ?? "—"}</p>
        <p><strong>Phone:</strong> {app.applicant.contactNumber}</p>
        <p><strong>Approved:</strong> {app.approvedAt ? format(new Date(app.approvedAt), "dd MMM yyyy") : "—"}</p>
        <p className="col-span-2"><strong>Address:</strong> {app.applicant.address}</p>
        <p className="col-span-2"><strong>Reason:</strong> {app.reason}</p>
        <p className="col-span-2"><strong>Police Report:</strong> {app.policeReport.reportNumber} · {app.policeReport.station} · {app.policeReport.date}</p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-10 text-xs">
        <div className="border-t border-black/40 pt-1">Issuing Officer Signature</div>
        <div className="border-t border-black/40 pt-1">Applicant Signature</div>
      </div>
      <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-[#0A3D91]">Registrar General's Office · Official Document</p>
    </div>
  );
}
