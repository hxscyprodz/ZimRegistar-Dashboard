import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Check, X, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/common/InfoRow";
import { DocumentCard } from "@/components/common/ImageViewer";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { RejectModal } from "@/components/common/RejectModal";
import { NationalIdCardPrint } from "@/components/print/NationalIdCardPrint";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth, useApps, type StaffMember } from "@/lib/store";
import {
  approveApplicationApi,
  getApplicationApi,
  rejectApplicationApi,
  listStaffApi,
  listNationalIdApi,
} from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import type { NationalIdApp } from "@/lib/types";

export const Route = createFileRoute("/_app/applications/national-id/$id")({
  head: () => ({ meta: [{ title: "National ID Application" }] }),
  loader: async ({ params: { id } }) => {
    const res = await getApplicationApi("nationalId", id);
    return res.data as NationalIdApp;
  },
  component: Page,
  errorComponent: () => (
    <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
      <h3 className="font-bold">Application not found</h3>
      <p className="text-sm">The National ID application you are looking for does not exist.</p>
    </div>
  ),
});

function Page() {
  const router = useRouter();
  const app = Route.useLoaderData();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const setNationalId = useApps((s) => s.setNationalId);
  const user = useAuth((s) => s.user);
  const isSuper = user?.role === "Super Administrator";
  const isOtherStation = user && !isSuper && app && user.stationId !== app.stationId;
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    listStaffApi().then((res) => setStaff(res.data));
  }, []);

  const approverName = useMemo(() => {
    if (!app.approvedBy || !staff.length) return app.approvedBy;
    const approver = staff.find((s) => s._id === app.approvedBy);
    if (!approver) return app.approvedBy;
    return `${approver.firstName} ${approver.surname}`;
  }, [app.approvedBy, staff]);

  const rejecterName = useMemo(() => {
    if (!app.rejectedBy || !staff.length) return app.rejectedBy;
    const rejecter = staff.find((s) => s._id === app.rejectedBy);
    if (!rejecter) return app.rejectedBy;
    return `${rejecter.firstName} ${rejecter.surname}`;
  }, [app.rejectedBy, staff]);

  if (!app || isOtherStation)
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        {isOtherStation ? "This application belongs to another station." : "Application not found."}
        <div>
          <Link to="/applications/national-id" className="text-gov hover:underline">
            Back
          </Link>
        </div>
      </div>
    );

  return (
    <div>
      <Link
        to="/applications/national-id"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <PageHeader
        title={`Application ${app.applicationId}`}
        description={`Submitted on ${format(new Date(app.applicationDate), "dd MMMM yyyy")}`}
        actions={<StatusBadge status={app.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-2 font-display text-base font-bold">Applicant Information</h3>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <InfoRow label="First Name" value={app.birthDetails.firstName} />
              <InfoRow label="Last Name" value={app.birthDetails.surname} />
              <InfoRow
                label="Date of Birth"
                value={format(new Date(app.birthDetails.dateOfBirth), "dd MMM yyyy")}
              />
              <InfoRow label="Gender" value={app.birthDetails.sex} />
              <div className="sm:col-span-2">
                <InfoRow label="Address" value={app.address} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-2 font-display text-base font-bold">Supporting Documents</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DocumentCard label="Birth Certificate" src={app.documents.birthCertificate} />
            </div>
          </div>

          {app.status === "Rejected" && app.rejectionReason ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-1 font-display text-base font-bold">Rejection Details</h3>
              <p className="text-sm">
                <strong>Reason:</strong> {app.rejectionReason}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Rejected by {rejecterName} on{" "}
                {app.rejectedDate ? format(new Date(app.rejectedDate), "dd MMM yyyy, p") : "—"}
              </p>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-bold">Actions</h3>
            <div className="mt-3 space-y-2">
              <Button
                className="w-full bg-emerald-600 text-white hover:bg-emerald-600/90"
                disabled={app.status !== "Pending" || isSuper}
                onClick={() => setApproveOpen(true)}
              >
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                disabled={app.status !== "Pending" || isSuper}
                onClick={() => setRejectOpen(true)}
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={app.status !== "Approved"}
                onClick={() => setPrintOpen(true)}
              >
                <Printer className="mr-2 h-4 w-4" /> Print ID Card
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSummaryOpen(true)}>
                <FileText className="mr-2 h-4 w-4" /> Print Application Summary
              </Button>
            </div>
          </div>

          {app.status === "Approved" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              Approved by {approverName} on
              {app.applicationDate
                ? ` ${format(new Date(app.applicationDate), "dd MMM yyyy")}`
                : ""}
            </div>
          ) : null}
        </aside>
      </div>

      <ConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve this National ID application?"
        tone="success"
        confirmLabel="Yes, approve"
        onConfirm={async () => {
          await approveApplicationApi("nationalId", app._id, user?.id ?? "Officer");
          toast.success("Application approved.");
          router.invalidate(); // Refreshes current page loader
          listNationalIdApi().then((res) => setNationalId(res.data)); // Refreshes list data in store
        }}
      />
      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={async (reason) => {
          if (!user) return toast.error("You must be logged in.");
          await rejectApplicationApi("nationalId", app._id, reason);
          setRejectOpen(false);
          toast.success("Application rejected.");
          router.invalidate(); // Refreshes current page loader
          listNationalIdApi().then((res) => setNationalId(res.data)); // Refreshes list data in store
        }}
      />

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="print-document-dialog max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>National ID Card Preview</span>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="print-document-host max-h-[75vh] overflow-auto bg-muted p-6">
            <NationalIdCardPrint app={app} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Application Summary</span>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-auto bg-muted p-6">
            <div className="mx-auto max-w-2xl bg-white p-8 text-sm text-black">
              <h2 className="font-display text-xl font-bold text-[#0A3D91]">
                National ID Application — {app.applicationId}
              </h2>
              <hr className="my-3 border-[#0A3D91]/30" />
              <p>
                <strong>Name:</strong> {app.birthDetails.firstName} {app.birthDetails.surname}
              </p>
              <p>
                <strong>DOB:</strong>{" "}
                {format(new Date(app.birthDetails.dateOfBirth), "dd MMM yyyy")} ·{" "}
                <strong>Gender:</strong> {app.birthDetails.sex}
              </p>
              <p>
                <strong>National ID:</strong> {app.nationalIdNumber}
              </p>
              <p>
                <strong>Address:</strong> {app.address}
              </p>
              <p className="mt-3">
                <strong>Status:</strong> {app.status}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
