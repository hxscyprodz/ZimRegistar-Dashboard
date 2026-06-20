import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useApps } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/approved-applications")({
  head: () => ({ meta: [{ title: "Approved Applications" }] }),
  component: Approved,
});

type Kind = "birth" | "nationalId" | "recovery";

function Approved() {
  const { birth, nationalId, recovery, markPrinted } = useApps();
  const [q, setQ] = useState("");

  const filter = <T extends { applicantName: string; applicationNumber: string; status: string }>(arr: T[]) =>
    arr.filter((a) => a.status === "Approved" && (q === "" ||
      a.applicantName.toLowerCase().includes(q.toLowerCase()) ||
      a.applicationNumber.toLowerCase().includes(q.toLowerCase())));

  const aBirth = useMemo(() => filter(birth), [birth, q]);
  const aNid = useMemo(() => filter(nationalId), [nationalId, q]);
  const aRec = useMemo(() => filter(recovery), [recovery, q]);

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
                    <Button size="sm" onClick={() => { markPrinted(kind, a.id); toast.success("Marked as printed"); }} disabled={a.printStatus === "Printed"}>
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
    </div>
  );
}
