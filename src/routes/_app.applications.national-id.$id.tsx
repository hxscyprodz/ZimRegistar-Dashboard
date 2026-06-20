import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/common/InfoRow";
import { DocumentCard } from "@/components/common/ImageViewer";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { RejectModal } from "@/components/common/RejectModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApps, useAuth } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/applications/national-id/$id")({
  head: () => ({ meta: [{ title: "National ID Application" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const app = useApps((s) => s.nationalId.find((a) => a.id === id));
  const { approve, reject } = useApps();
  const user = useAuth((s) => s.user);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!app) return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      Application not found.
      <div><Link to="/applications/national-id" className="text-gov hover:underline">Back</Link></div>
    </div>
  );

  return (
    <div>
      <Link to="/applications/national-id" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <PageHeader title={`Application ${app.applicationNumber}`}
        description={`Submitted on ${format(new Date(app.dateSubmitted), "dd MMMM yyyy")}`}
        actions={<StatusBadge status={app.status} />} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-2 font-display text-base font-bold">Applicant Information</h3>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <InfoRow label="First Name" value={app.applicant.firstName} />
              <InfoRow label="Last Name" value={app.applicant.lastName} />
              <InfoRow label="Date of Birth" value={app.applicant.dateOfBirth} />
              <InfoRow label="Gender" value={app.applicant.gender} />
              <InfoRow label="Nationality" value={app.applicant.nationality} />
              <InfoRow label="Contact Number" value={app.applicant.contactNumber} />
              <div className="sm:col-span-2"><InfoRow label="Address" value={app.applicant.address} /></div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-2 font-display text-base font-bold">Supporting Documents</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DocumentCard label="Birth Certificate" src={app.documents.birthCertificate} />
              <DocumentCard label="Proof of Residence" src={app.documents.proofOfResidence} />
              <DocumentCard label="Applicant Photo" src={app.documents.photo} />
            </div>
          </div>

          {app.status === "Rejected" && app.rejectionReason ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-1 font-display text-base font-bold">Rejection Details</h3>
              <p className="text-sm"><strong>Reason:</strong> {app.rejectionReason}</p>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-bold">Actions</h3>
            <div className="mt-3 space-y-2">
              <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-600/90"
                disabled={app.status !== "Pending"} onClick={() => setApproveOpen(true)}>
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button variant="destructive" className="w-full" disabled={app.status !== "Pending"} onClick={() => setRejectOpen(true)}>
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSummaryOpen(true)}>
                <Printer className="mr-2 h-4 w-4" /> Print Summary
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal open={approveOpen} onOpenChange={setApproveOpen}
        title="Approve this National ID application?" tone="success" confirmLabel="Yes, approve"
        onConfirm={() => { approve("nationalId", app.id, user?.name ?? "Officer"); toast.success("Approved"); }} />
      <RejectModal open={rejectOpen} onOpenChange={setRejectOpen}
        onConfirm={(reason) => { reject("nationalId", app.id, reason, user?.name ?? "Officer"); setRejectOpen(false); toast.success("Rejected"); }} />

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Application Summary</span>
              <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-auto bg-muted p-6">
            <div className="mx-auto max-w-2xl bg-white p-8 text-sm text-black">
              <h2 className="font-display text-xl font-bold text-[#0A3D91]">National ID Application — {app.applicationNumber}</h2>
              <hr className="my-3 border-[#0A3D91]/30" />
              <p><strong>Name:</strong> {app.applicant.firstName} {app.applicant.lastName}</p>
              <p><strong>DOB:</strong> {app.applicant.dateOfBirth} · <strong>Gender:</strong> {app.applicant.gender}</p>
              <p><strong>Nationality:</strong> {app.applicant.nationality}</p>
              <p><strong>Contact:</strong> {app.applicant.contactNumber}</p>
              <p><strong>Address:</strong> {app.applicant.address}</p>
              <p className="mt-3"><strong>Status:</strong> {app.status}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}