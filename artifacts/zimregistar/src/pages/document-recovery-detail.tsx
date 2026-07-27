import { Link, useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { ChevronLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { useApps, useAuth, useUserStation } from "@/lib/store";
import { DataCard } from "@/components/common/DataCard";
import { InfoRow } from "@/components/common/InfoRow";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { RejectModal } from "@/components/common/RejectModal";
import { toast } from "sonner";
import { useState } from "react";

export function RecoveryDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const stationId = useUserStation();
  const { recovery, approve, reject } = useApps();
  const rawApp = recovery.find(a => a.id === id);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!rawApp) return <div className="p-8">Application not found</div>;
  if (stationId && rawApp.stationId !== stationId) return <div className="p-8">Access denied</div>;
  
  const app = rawApp;

  const handleApprove = () => {
    approve("recovery", app.id, user?.name ?? "Staff");
    toast.success("Recovery request approved.");
  };

  const handleReject = (reason: string) => {
    reject("recovery", app.id, reason, user?.name ?? "Staff");
    toast.error("Recovery request rejected.");
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <Link href="/applications/document-recovery" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back to List
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[18px] font-semibold text-foreground">Application <span className="font-mono">{app.applicationNumber}</span></h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-sm text-muted-foreground">Submitted on {format(new Date(app.dateSubmitted), "MMMM d, yyyy")} • Station: {app.stationId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DataCard title="Recovery Request Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <InfoRow label="Target Document" value={<span className="font-semibold text-primary">{app.documentType}</span>} />
              <InfoRow label="Reason for Recovery" value={app.reason} />
              <div className="sm:col-span-2 border border-border bg-muted/30 p-4 mt-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border/50 pb-2">Police Report Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InfoRow label="Report Number" value={<span className="font-mono">{app.policeReport.reportNumber}</span>} />
                  <InfoRow label="Police Station" value={app.policeReport.station} />
                  <InfoRow label="Date Reported" value={format(new Date(app.policeReport.date), "MMMM d, yyyy")} />
                </div>
              </div>
            </div>
          </DataCard>

          <DataCard title="Applicant Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <InfoRow label="First Name" value={app.applicant.firstName} />
              <InfoRow label="Last Name" value={app.applicant.lastName} />
              {app.applicant.nationalId && <InfoRow label="National ID" value={<span className="font-mono">{app.applicant.nationalId}</span>} />}
              <InfoRow label="Contact Number" value={app.applicant.contactNumber} />
              <div className="sm:col-span-2"><InfoRow label="Residential Address" value={app.applicant.address} /></div>
            </div>
          </DataCard>
        </div>

        <div className="space-y-6">
          <DataCard title="Processing Actions">
            {app.status === "Pending" ? (
              <div className="space-y-3">
                <Button className="w-full" onClick={() => setApproveOpen(true)}><CheckCircle className="mr-2 h-4 w-4" /> Approve Recovery</Button>
                <Button variant="destructive" className="w-full" onClick={() => setRejectOpen(true)}><XCircle className="mr-2 h-4 w-4" /> Reject Recovery</Button>
              </div>
            ) : app.status === "Approved" ? (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md p-3 text-sm text-emerald-800 dark:text-emerald-300">
                <p className="font-semibold flex items-center"><CheckCircle className="mr-1.5 h-4 w-4" /> Approved</p>
                <p className="mt-1 text-xs">By {app.approvedBy} on {app.approvedAt && format(new Date(app.approvedAt), "MMM d, yyyy")}</p>
                <p className="mt-3 text-xs opacity-80">This application has been forwarded to the Printing Centre.</p>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md p-3 text-sm text-red-800 dark:text-red-300">
                <p className="font-semibold flex items-center"><XCircle className="mr-1.5 h-4 w-4" /> Rejected</p>
                <p className="mt-1 text-xs">By {app.rejectedBy} on {app.rejectedAt && format(new Date(app.rejectedAt), "MMM d, yyyy")}</p>
                {app.rejectionReason && <div className="mt-2 pt-2 border-t border-red-200/50 dark:border-red-500/20"><p className="text-xs font-semibold">Reason:</p><p className="text-xs mt-0.5">{app.rejectionReason}</p></div>}
              </div>
            )}
          </DataCard>
        </div>
      </div>

      <ConfirmModal open={approveOpen} onOpenChange={setApproveOpen} title="Approve Recovery Request" description="Verify police report details before approval." confirmLabel="Approve Request" tone="success" onConfirm={handleApprove} />
      <RejectModal open={rejectOpen} onOpenChange={setRejectOpen} onConfirm={handleReject} />
    </div>
  );
}