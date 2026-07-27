import { Link, useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { ChevronLeft, FileText, CheckCircle, XCircle, Printer, Clock } from "lucide-react";
import { useApps, useAuth, useUserStation, filterByStation } from "@/lib/store";
import { PageHeader } from "@/components/common/PageHeader";
import { DataCard } from "@/components/common/DataCard";
import { InfoRow } from "@/components/common/InfoRow";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { RejectModal } from "@/components/common/RejectModal";
import { DocumentCard } from "@/components/common/DocumentCard";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BirthCertificatePrint } from "@/components/print/BirthCertificatePrint";
import { useState } from "react";

export function BirthCertDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const stationId = useUserStation();
  const { birth, approve, reject, markPrinted } = useApps();
  const rawApp = birth.find(a => a.id === id);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  if (!rawApp) return <div className="p-8">Application not found</div>;
  if (stationId && rawApp.stationId !== stationId) return <div className="p-8">Access denied</div>;
  
  const app = rawApp;

  const handleApprove = () => {
    approve("birth", app.id, user?.name ?? "Staff");
    toast.success("Application approved successfully.");
  };

  const handleReject = (reason: string) => {
    reject("birth", app.id, reason, user?.name ?? "Staff");
    toast.error("Application rejected.");
  };

  const handlePrint = () => {
    if (app.printStatus !== "Printed") {
      markPrinted("birth", app.id);
    }
    window.print();
  };

  return (
    <div className="space-y-6 pb-10 print-document-host">
      <div className="no-print">
        <Link href="/applications/birth-certificates" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
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

      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DataCard title="Child Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <InfoRow label="First Name" value={app.child.firstName} />
              <InfoRow label="Last Name" value={app.child.lastName} />
              <InfoRow label="Date of Birth" value={format(new Date(app.child.dateOfBirth), "MMMM d, yyyy")} />
              <InfoRow label="Gender" value={app.child.gender} />
              <InfoRow label="Place of Birth" value={`${app.child.hospital}, ${app.child.cityOfBirth}`} />
              <InfoRow label="Residential Address" value={app.child.address} />
            </div>
          </DataCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DataCard title="Mother's Information">
              <InfoRow label="First Name" value={app.mother.firstName} />
              <InfoRow label="Last Name" value={app.mother.lastName} />
              <InfoRow label="National ID" value={<span className="font-mono">{app.mother.nationalId}</span>} />
            </DataCard>
            <DataCard title="Father's Information">
              <InfoRow label="First Name" value={app.father.firstName} />
              <InfoRow label="Last Name" value={app.father.lastName} />
              <InfoRow label="National ID" value={<span className="font-mono">{app.father.nationalId}</span>} />
            </DataCard>
          </div>

          <DataCard title="Supporting Documents">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DocumentCard label="Birth Record" src={app.documents.birthCertificate} />
            </div>
          </DataCard>
        </div>

        <div className="space-y-6">
          <DataCard title="Processing Actions">
            {app.status === "Pending" ? (
              <div className="space-y-3">
                <Button className="w-full" onClick={() => setApproveOpen(true)}><CheckCircle className="mr-2 h-4 w-4" /> Approve Application</Button>
                <Button variant="destructive" className="w-full" onClick={() => setRejectOpen(true)}><XCircle className="mr-2 h-4 w-4" /> Reject Application</Button>
              </div>
            ) : app.status === "Approved" ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md p-3 text-sm text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold flex items-center"><CheckCircle className="mr-1.5 h-4 w-4" /> Approved</p>
                  <p className="mt-1 text-xs">By {app.approvedBy} on {app.approvedAt && format(new Date(app.approvedAt), "MMM d, yyyy")}</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Printing Status</p>
                  {app.printStatus === "Printed" ? (
                    <div className="text-sm font-medium text-emerald-600 flex items-center mb-3">
                      <CheckCircle className="mr-1.5 h-4 w-4" /> Printed on {app.printedAt && format(new Date(app.printedAt), "MMM d, yyyy")}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-amber-600 flex items-center mb-3">
                      <Clock className="mr-1.5 h-4 w-4" /> Not Printed
                    </div>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => setPrintOpen(true)}><Printer className="mr-2 h-4 w-4" /> Print Certificate</Button>
                </div>
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

      <ConfirmModal
        open={approveOpen} onOpenChange={setApproveOpen}
        title="Approve Application"
        description={`Are you sure you want to approve application ${app.applicationNumber}? This action will move it to the Printing Centre.`}
        confirmLabel="Approve"
        tone="success"
        onConfirm={handleApprove}
      />
      
      <RejectModal
        open={rejectOpen} onOpenChange={setRejectOpen}
        onConfirm={handleReject}
      />

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 no-print">
          <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Print Preview</h2>
            <Button onClick={handlePrint} size="sm"><Printer className="mr-2 h-4 w-4" /> Print Document</Button>
          </div>
          <div className="overflow-auto bg-gray-100 p-8 flex-1">
            <BirthCertificatePrint app={app} />
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="hidden print:block">
        <BirthCertificatePrint app={app} />
      </div>
    </div>
  );
}