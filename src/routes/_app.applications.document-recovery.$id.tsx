import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/common/InfoRow";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { RejectModal } from "@/components/common/RejectModal";
import { useApps, useAuth } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/applications/document-recovery/$id")({
  head: () => ({ meta: [{ title: "Document Recovery Application" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const app = useApps((s) => s.recovery.find((a) => a.id === id));
  const { approve, reject } = useApps();
  const user = useAuth((s) => s.user);
  const isSuper = user?.role === "Super Administrator";
  const isOtherStation = user && !isSuper && app && user.stationId !== app.stationId;
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!app || isOtherStation) return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      {isOtherStation ? "This application belongs to another station." : "Application not found."}
      <div><Link to="/applications/document-recovery" className="text-gov hover:underline">Back</Link></div>
    </div>
  );

  return (
    <div>
      <Link to="/applications/document-recovery" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <PageHeader title={`Recovery ${app.applicationNumber}`}
        description={`${app.documentType} · Submitted ${format(new Date(app.dateSubmitted), "dd MMM yyyy")}`}
        actions={<StatusBadge status={app.status} />} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-2 font-display text-base font-bold">Applicant Information</h3>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <InfoRow label="First Name" value={app.applicant.firstName} />
              <InfoRow label="Last Name" value={app.applicant.lastName} />
              <InfoRow label="National ID" value={app.applicant.nationalId ?? "—"} />
              <InfoRow label="Contact" value={app.applicant.contactNumber} />
              <div className="sm:col-span-2"><InfoRow label="Address" value={app.applicant.address} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-2 font-display text-base font-bold">Lost Document</h3>
              <InfoRow label="Document Type" value={app.documentType} />
              <InfoRow label="Recovery Reason" value={app.reason} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-2 font-display text-base font-bold">Police Report</h3>
              <InfoRow label="Report Number" value={app.policeReport.reportNumber} />
              <InfoRow label="Station" value={app.policeReport.station} />
              <InfoRow label="Report Date" value={app.policeReport.date} />
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
                disabled={app.status !== "Pending" || isSuper} onClick={() => setApproveOpen(true)}>
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button variant="destructive" className="w-full"
                disabled={app.status !== "Pending" || isSuper} onClick={() => setRejectOpen(true)}>
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal open={approveOpen} onOpenChange={setApproveOpen}
        title="Approve recovery application?" tone="success" confirmLabel="Yes, approve"
        onConfirm={() => { approve("recovery", app.id, user?.name ?? "Officer"); toast.success("Approved"); }} />
      <RejectModal open={rejectOpen} onOpenChange={setRejectOpen}
        onConfirm={(reason) => { reject("recovery", app.id, reason, user?.name ?? "Officer"); setRejectOpen(false); toast.success("Rejected"); }} />
    </div>
  );
}