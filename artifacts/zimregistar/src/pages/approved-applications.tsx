import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ChevronRight, FileText, IdCard, FileSearch } from "lucide-react";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar, SearchInput } from "@/components/common/FilterBar";
import { TableContainer, Th, Td } from "@/components/common/TableContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";

export function ApprovedPage() {
  const stationId = useUserStation();
  const rawBirth = useApps(s => s.birth);
  const rawNationalId = useApps(s => s.nationalId);
  const rawRecovery = useApps(s => s.recovery);

  const [search, setSearch] = useState("");

  const appsBirth = filterByStation(rawBirth, stationId).filter(a => a.status === "Approved");
  const appsNationalId = filterByStation(rawNationalId, stationId).filter(a => a.status === "Approved");
  const appsRecovery = filterByStation(rawRecovery, stationId).filter(a => a.status === "Approved");

  const filterFn = (a: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.applicationNumber.toLowerCase().includes(q) || a.applicantName.toLowerCase().includes(q);
  };

  const b = appsBirth.filter(filterFn);
  const n = appsNationalId.filter(filterFn);
  const r = appsRecovery.filter(filterFn);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Approved Applications" description="Browse applications cleared for printing." />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by App # or Name..." />
      </FilterBar>

      <Tabs defaultValue="birth" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-10 max-w-[400px]">
          <TabsTrigger value="birth">Birth Certs ({b.length})</TabsTrigger>
          <TabsTrigger value="nid">National ID ({n.length})</TabsTrigger>
          <TabsTrigger value="rec">Recovery ({r.length})</TabsTrigger>
        </TabsList>
        <div className="mt-4 border border-border bg-card">
          <TabsContent value="birth" className="m-0 border-0">
            <TableContainer>
              <thead>
                <tr>
                  <Th>Application #</Th>
                  <Th>Applicant Name</Th>
                  <Th>Approved By</Th>
                  <Th>Approved Date</Th>
                  <Th>Print Status</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {b.length === 0 ? <tr><Td colSpan={6}><EmptyState icon={FileText} title="No approved applications" /></Td></tr> : b.map(app => (
                  <tr key={app.id} className="hover:bg-muted/30">
                    <Td><span className="font-mono text-[13px]">{app.applicationNumber}</span></Td>
                    <Td className="font-medium">{app.applicantName}</Td>
                    <Td>{app.approvedBy}</Td>
                    <Td>{app.approvedAt && format(new Date(app.approvedAt), "dd MMM yyyy")}</Td>
                    <Td><StatusBadge status={app.printStatus ?? "Not Printed"} /></Td>
                    <Td className="text-right">
                      <Link href={`/applications/birth-certificates/${app.id}`} className="text-xs font-medium text-primary hover:underline">View <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" /></Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </TabsContent>
          <TabsContent value="nid" className="m-0 border-0">
            <TableContainer>
              <thead>
                <tr>
                  <Th>Application #</Th>
                  <Th>Applicant Name</Th>
                  <Th>Approved By</Th>
                  <Th>Approved Date</Th>
                  <Th>Print Status</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {n.length === 0 ? <tr><Td colSpan={6}><EmptyState icon={IdCard} title="No approved applications" /></Td></tr> : n.map(app => (
                  <tr key={app.id} className="hover:bg-muted/30">
                    <Td><span className="font-mono text-[13px]">{app.applicationNumber}</span></Td>
                    <Td className="font-medium">{app.applicantName}</Td>
                    <Td>{app.approvedBy}</Td>
                    <Td>{app.approvedAt && format(new Date(app.approvedAt), "dd MMM yyyy")}</Td>
                    <Td><StatusBadge status={app.printStatus ?? "Not Printed"} /></Td>
                    <Td className="text-right">
                      <Link href={`/applications/national-id/${app.id}`} className="text-xs font-medium text-primary hover:underline">View <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" /></Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </TabsContent>
          <TabsContent value="rec" className="m-0 border-0">
            <TableContainer>
              <thead>
                <tr>
                  <Th>Application #</Th>
                  <Th>Applicant Name</Th>
                  <Th>Target Document</Th>
                  <Th>Approved By</Th>
                  <Th>Print Status</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {r.length === 0 ? <tr><Td colSpan={6}><EmptyState icon={FileSearch} title="No approved applications" /></Td></tr> : r.map(app => (
                  <tr key={app.id} className="hover:bg-muted/30">
                    <Td><span className="font-mono text-[13px]">{app.applicationNumber}</span></Td>
                    <Td className="font-medium">{app.applicantName}</Td>
                    <Td>{app.documentType}</Td>
                    <Td>{app.approvedBy}</Td>
                    <Td><StatusBadge status={app.printStatus ?? "Not Printed"} /></Td>
                    <Td className="text-right">
                      <Link href={`/applications/document-recovery/${app.id}`} className="text-xs font-medium text-primary hover:underline">View <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" /></Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}