import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, X, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/common/InfoRow";
import { DocumentCard } from "@/components/common/ImageViewer";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { RejectModal } from "@/components/common/RejectModal";
import { BirthCertificatePrint } from "@/components/print/BirthCertificatePrint";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApps, useAuth } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/applications/birth-certificates/$id")({
  head: () => ({ meta: [{ title: "Birth Certificate Application" }] }),
  component: Page,
  notFoundComponent: () => <div className="p-6">Application not found.</div>,
});

function Page() {
  const { id } = Route.useParams();
  const app = useApps((s) => s.birth.find((a) => a.id === id));
  const { approve, reject } = useApps();
  const user = useAuth((s) => s.user);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!app) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-semibold">Application not found.</p>
        <Link to="/applications/birth-certificates" className="mt-2 inline-block text-sm text-gov hover:underline">Back to list</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/applications/birth-certificates" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>
      <PageHeader
        title={`Application ${app.applicationNumber}`}
        description={`Submitted on ${format(new Date(app.dateSubmitted), "dd MMMM yyyy")}`}
        actions={<StatusBadge status={app.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Child Information">
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <InfoRow label="First Name" value={app.child.firstName} />
              <InfoRow label="Last Name" value={app.child.lastName} />
              <InfoRow label="Date of Birth" value={app.child.dateOfBirth} />
              <InfoRow label="Gender" value={app.child.gender} />
              <InfoRow label="Hospital of Birth" value={app.child.hospital} />
              <InfoRow label="City / Town of Birth" value={app.child.cityOfBirth} />
              <div className="sm:col-span-2"><InfoRow label="Residential Address" value={app.child.address} /></div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card title="Mother's Information">
              <InfoRow label="First Name" value={app.mother.firstName} />
              <InfoRow label="Last Name" value={app.mother.lastName} />
              <InfoRow label="National ID" value={app.mother.nationalId} />
            </Card>
            <Card title="Father's Information">
              <InfoRow label="First Name" value={app.father.firstName} />
              <InfoRow label="Last Name" value={app.father.lastName} />
              <InfoRow label="National ID" value={app.father.nationalId} />
            </Card>
          </div>

          <Card title="Uploaded Documents">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DocumentCard label="Hospital Birth Record" src={app.documents.hospitalRecord} />
              <DocumentCard label="Mother's National ID" src={app.documents.motherId} />
              <DocumentCard label="Father's National ID" src={app.documents.fatherId} />
            </div>
          </Card>

          {app.status === "Rejected" && app.rejectionReason ? (
            <Card title="Rejection Details">
              <p className="text-sm"><strong>Reason:</strong> {app.rejectionReason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Rejected by {app.rejectedBy} on {app.rejectedAt ? format(new Date(app.rejectedAt), "dd MMM yyyy, p") : "—"}
              </p>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-bold">Actions</h3>
            <p className="mt-1 text-xs text-muted-foreground">Decide on this application.</p>
            <div className="mt-4 space-y-2">
              <Button
                className="w-full bg-emerald-600 text-white hover:bg-emerald-600/90"
                disabled={app.status !== "Pending"}
                onClick={() => setApproveOpen(true)}
              >
                <Check className="mr-2 h-4 w-4" /> Approve Application
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                disabled={app.status !== "Pending"}
                onClick={() => setRejectOpen(true)}
              >
                <X className="mr-2 h-4 w-4" /> Reject Application
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-bold">Printing</h3>
            <p className="mt-1 text-xs text-muted-foreground">Available once approved.</p>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full" disabled={app.status !== "Approved"} onClick={() => setPrintOpen(true)}>
                <Printer className="mr-2 h-4 w-4" /> Print Birth Certificate
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSummaryOpen(true)}>
                <FileText className="mr-2 h-4 w-4" /> Print Application Summary
              </Button>
            </div>
          </div>

          {app.status === "Approved" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              Approved by {app.approvedBy} on {app.approvedAt ? format(new Date(app.approvedAt), "dd MMM yyyy") : "—"}
            </div>
          ) : null}
        </aside>
      </div>

      <ConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve this application?"
        description="The applicant will be notified and the birth certificate will be queued for printing."
        confirmLabel="Yes, approve"
        tone="success"
        onConfirm={() => {
          approve("birth", app.id, user?.name ?? "Officer");
          toast.success("Application approved");
        }}
      />
      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={(reason) => {
          reject("birth", app.id, reason, user?.name ?? "Officer");
          setRejectOpen(false);
          toast.success("Application rejected");
        }}
      />

      <PrintDialog open={printOpen} onOpenChange={setPrintOpen} title="Birth Certificate Preview">
        <BirthCertificatePrint app={app} />
      </PrintDialog>

      <PrintDialog open={summaryOpen} onOpenChange={setSummaryOpen} title="Application Summary">
        <SummaryDoc app={app} />
      </PrintDialog>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-2 font-display text-base font-bold">{title}</h3>
      {children}
    </div>
  );
}

function PrintDialog({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-auto bg-muted p-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryDoc({ app }: { app: import("@/lib/types").BirthCertificateApp }) {
  return (
    <div className="mx-auto w-full max-w-3xl bg-white p-8 text-sm text-black">
      <h2 className="font-display text-xl font-bold text-[#0A3D91]">Application Summary — {app.applicationNumber}</h2>
      <p className="text-xs text-black/60">Birth Certificate · Submitted {format(new Date(app.dateSubmitted), "dd MMM yyyy")}</p>
      <hr className="my-3 border-[#0A3D91]/30" />
      <h3 className="font-bold">Child</h3>
      <p>{app.child.firstName} {app.child.lastName} · {app.child.gender} · {app.child.dateOfBirth}</p>
      <p>{app.child.hospital}, {app.child.cityOfBirth}</p>
      <p>{app.child.address}</p>
      <h3 className="mt-3 font-bold">Mother</h3>
      <p>{app.mother.firstName} {app.mother.lastName} · {app.mother.nationalId}</p>
      <h3 className="mt-3 font-bold">Father</h3>
      <p>{app.father.firstName} {app.father.lastName} · {app.father.nationalId}</p>
      <h3 className="mt-3 font-bold">Status</h3>
      <p>{app.status} {app.approvedBy ? `· by ${app.approvedBy}` : ""}</p>
    </div>
  );
}