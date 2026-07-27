import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Printer, CheckCircle, Clock } from "lucide-react";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar, SearchInput, SortSelect } from "@/components/common/FilterBar";
import { TableContainer, Th, Td } from "@/components/common/TableContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BirthCertificatePrint } from "@/components/print/BirthCertificatePrint";
import { NationalIdCardPrint } from "@/components/print/NationalIdCardPrint";

export function PrintingCenterPage() {
  const stationId = useUserStation();
  const rawBirth = useApps(s => s.birth);
  const rawNationalId = useApps(s => s.nationalId);
  const rawRecovery = useApps(s => s.recovery);
  const { markPrinted } = useApps();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeApp, setActiveApp] = useState<any>(null);

  const allApps = [
    ...filterByStation(rawBirth, stationId).filter(a => a.status === "Approved"),
    ...filterByStation(rawNationalId, stationId).filter(a => a.status === "Approved"),
    ...filterByStation(rawRecovery, stationId).filter(a => a.status === "Approved")
  ].sort((a, b) => new Date(a.approvedAt!).getTime() - new Date(b.approvedAt!).getTime());

  const filtered = allApps.filter(a => {
    if (filter === "unprinted" && a.printStatus === "Printed") return false;
    if (filter === "printed" && a.printStatus !== "Printed") return false;
    if (search) {
      const q = search.toLowerCase();
      return a.applicationNumber.toLowerCase().includes(q) || a.applicantName.toLowerCase().includes(q);
    }
    return true;
  });

  const handlePrint = () => {
    if (activeApp && activeApp.printStatus !== "Printed") {
      const kind = activeApp.type === "Birth Certificate" || (activeApp.type === "Document Recovery" && activeApp.documentType === "Birth Certificate") ? "birth" : "nationalId";
      markPrinted(kind as any, activeApp.id);
    }
    window.print();
  };

  return (
    <div className="space-y-6 pb-10 print-document-host">
      <div className="no-print">
        <PageHeader title="Printing Centre" description="Queue of approved documents ready for physical printing." />

        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search queue..." />
          <SortSelect value={filter} onChange={setFilter} options={[
            { value: "all", label: "All Records" },
            { value: "unprinted", label: "Unprinted Only" },
            { value: "printed", label: "Printed Only" }
          ]} />
        </FilterBar>

        <TableContainer>
          <thead>
            <tr>
              <Th>Application #</Th>
              <Th>Applicant Name</Th>
              <Th>Document Type</Th>
              <Th>Approved Date</Th>
              <Th>Status</Th>
              <Th right>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr><Td colSpan={6}><EmptyState icon={Printer} title="Queue is empty" /></Td></tr>
            ) : filtered.map((app) => (
              <tr key={app.id} className="hover:bg-muted/30">
                <Td><span className="font-mono text-[13px]">{app.applicationNumber}</span></Td>
                <Td className="font-medium">{app.applicantName}</Td>
                <Td>
                  {app.type === "Document Recovery" ? `Recovery (${app.documentType})` : app.type}
                </Td>
                <Td>{app.approvedAt && format(new Date(app.approvedAt), "dd MMM yyyy")}</Td>
                <Td><StatusBadge status={app.printStatus ?? "Not Printed"} /></Td>
                <Td className="text-right">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setActiveApp(app)}>
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Preview & Print
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableContainer>
      </div>

      <Dialog open={!!activeApp} onOpenChange={(v) => { if (!v) setActiveApp(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 no-print">
          <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Print Queue Preview</h2>
            <Button onClick={handlePrint} size="sm"><Printer className="mr-2 h-4 w-4" /> Issue Document</Button>
          </div>
          <div className="overflow-auto bg-gray-200 p-8 flex-1">
            {activeApp && (
              activeApp.type === "Birth Certificate" || (activeApp.type === "Document Recovery" && activeApp.documentType === "Birth Certificate") ? (
                <BirthCertificatePrint app={activeApp} />
              ) : (
                <NationalIdCardPrint app={activeApp} />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="hidden print:block">
        {activeApp && (
          activeApp.type === "Birth Certificate" || (activeApp.type === "Document Recovery" && activeApp.documentType === "Birth Certificate") ? (
            <BirthCertificatePrint app={activeApp} />
          ) : (
            <NationalIdCardPrint app={activeApp} />
          )
        )}
      </div>
    </div>
  );
}