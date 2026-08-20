import { createFileRoute, Link, ErrorComponent, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
import {
  getApplicationApi,
  approveApplicationApi,
  listStaffApi,
  rejectApplicationApi,
} from "@/lib/api";
import { useAuth, type StaffMember } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";
import type { BirthCertificateApp } from "@/lib/types";

export const Route = createFileRoute("/_app/applications/birth-certificates/$id")({
  head: () => ({ meta: [{ title: "Birth Certificate Application" }] }),
  loader: async ({ params: { id } }) => {
    const res = await getApplicationApi("birth", id);
    console.log(res);
    return res.data as BirthCertificateApp;
  },
  component: Page,
  errorComponent: ({ error }) => (
    <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
      <h3 className="font-bold">Application not found</h3>
      <p className="text-sm">{error.message}</p>
    </div>
  ),
});

function Page() {
  const router = useRouter();
  const app = Route.useLoaderData();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const user = useAuth((s) => s.user);
  const isSuper = user?.role === "SUPER_ADMIN";
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

  if (!app || isOtherStation) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-semibold">
          {isOtherStation
            ? "This application belongs to another station."
            : "Application not found."}
        </p>
        <Link
          to="/applications/birth-certificates"
          className="mt-2 inline-block text-sm text-gov hover:underline"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/applications/birth-certificates"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>
      <PageHeader
        title={`Application ${app.trackingId}`}
        description={`Submitted on ${format(new Date(app.createdAt), "dd MMMM yyyy")}`}
        actions={<StatusBadge status={app.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Child Information">
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <InfoRow label="First Name" value={app.firstName} />
              <InfoRow label="Last Name" value={app.surname} />
              <InfoRow label="Date of Birth" value={app.dateOfBirth} />
              <InfoRow label="Gender" value={app.sex} />
              <InfoRow label="Hospital of Birth" value={app.hospitalOfBirth} />
              <InfoRow label="City / Town of Birth" value={app.placeOfBirth} />
              <div className="sm:col-span-2">
                <InfoRow label="Residential Address" value={app.address} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card title="Mother's Information">
              <InfoRow label="First Name" value={app.mother.firstName} />
              <InfoRow label="Last Name" value={app.mother.surname} />
              <InfoRow label="National ID" value={app.mother.nationalIdNumber} />
            </Card>
            <Card title="Father's Information">
              <InfoRow label="First Name" value={app.father.firstName || "Unknown"} />
              <InfoRow label="Last Name" value={app.father.surname || "Unknown"} />
              <InfoRow label="National ID" value={app.father.nationalIdNumber || "Unknown"} />
            </Card>
          </div>

          {app.documents?.hospitalRecord ? (
            <Card title="Uploaded Birth Documents">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DocumentCard label="Hospital Record" src={app.documents.hospitalRecord} />
                <DocumentCard label="Mother's National ID" src={app.documents.motherNationalId} />
                <DocumentCard label="Father's National ID" src={app.documents.fatherNationalId} />
              </div>
            </Card>
          ) : null}

          {app.status === "REJECTED" && app.rejectionReason ? (
            <Card title="Rejection Details">
              <p className="text-sm">
                <strong>Reason:</strong> {app.rejectionReason}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Rejected by {rejecterName} on{" "}
                {app.rejectedDate ? format(new Date(app.rejectedDate), "dd MMM yyyy, p") : "—"}
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
                disabled={app.status !== "PENDING" || isSuper}
                onClick={() => setApproveOpen(true)}
              >
                <Check className="mr-2 h-4 w-4" /> Approve Application
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                disabled={app.status !== "PENDING" || isSuper}
                onClick={() => setRejectOpen(true)}
              >
                <X className="mr-2 h-4 w-4" /> Reject Application
              </Button>
              {isSuper ? (
                <p className="text-xs text-muted-foreground">
                  System administrators have view-only access to applications.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-bold">Printing</h3>
            <p className="mt-1 text-xs text-muted-foreground">Available once approved.</p>
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={app.status !== "APPROVED"}
                onClick={() => setPrintOpen(true)}
              >
                <Printer className="mr-2 h-4 w-4" /> Print Birth Certificate
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSummaryOpen(true)}>
                <FileText className="mr-2 h-4 w-4" /> Print Application Summary
              </Button>
            </div>
          </div>

          {app.status === "APPROVED" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              Approved by {approverName} on
              {app.createdAt ? ` ${format(new Date(app.createdAt), "dd MMM yyyy")}` : ""}
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
        onConfirm={async () => {
          await approveApplicationApi("birth", app.id, user?.name ?? "Officer");
          toast.success("Application approved");
          router.invalidate();
        }}
      />
      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={async (reason) => {
          await rejectApplicationApi("birth", app.id, reason);
          setRejectOpen(false);
          toast.success("Application rejected");
          router.invalidate();
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

function PrintDialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="print-document-dialog max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="print-document-host max-h-[75vh] overflow-auto bg-muted p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryDoc({ app }: { app: import("@/lib/types").BirthCertificateApp }) {
  return (
    <div className="mx-auto w-full max-w-3xl bg-white p-8 text-sm text-black">
      <h2 className="font-display text-xl font-bold text-[#0A3D91]">
        Application Summary — {app.trackingId}
      </h2>
      <p className="text-xs text-black/60">
        Birth Certificate · Submitted {format(new Date(app.createdAt), "dd MMM yyyy")}
      </p>
      <hr className="my-3 border-[#0A3D91]/30" />
      <h3 className="font-bold">Child</h3>
      <p>
        {app.firstName} {app.surname} · {app.sex} ·{" "}
        {format(new Date(app.dateOfBirth), "dd MMM yyyy")}
      </p>
      <p>
        {app.hospitalOfBirth}, {app.placeOfBirth}
      </p>
      <p>{app.address}</p>
      <h3 className="mt-3 font-bold">Mother</h3>
      <p>
        {app.mother.firstName} {app.mother.surname} · {app.mother.nationalIdNumber}
      </p>
      <h3 className="mt-3 font-bold">Father</h3>
      <p>
        {app.father.firstName} {app.father.surname} · {app.father.nationalIdNumber}
      </p>
      <h3 className="mt-3 font-bold">Status</h3>
      <p>
        {app.status} {app.approvedBy ? `· by ${app.approvedBy}` : ""}
      </p>
    </div>
  );
}
