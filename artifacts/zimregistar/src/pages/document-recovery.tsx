import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Search, FileSearch } from "lucide-react";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar, SearchInput, StatusSelect, SortSelect } from "@/components/common/FilterBar";
import { TableContainer, Th, Td } from "@/components/common/TableContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";

export function RecoveryListPage() {
  const stationId = useUserStation();
  const rawApps = useApps(s => s.recovery);
  const apps = filterByStation(rawApps, stationId);
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = apps.filter(a => {
    if (status !== "All" && a.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.applicationNumber.toLowerCase().includes(q) ||
             a.applicantName.toLowerCase().includes(q) ||
             a.policeReport.reportNumber.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (sort === "newest") return new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
    if (sort === "oldest") return new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime();
    return 0;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4 pb-10">
      <PageHeader 
        title="Document Recovery Applications" 
        description="Process requests for lost, stolen, or damaged documents."
        actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Application</Button>}
      />

      <FilterBar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by App #, Name, Report #..." />
        <StatusSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        <SortSelect value={sort} onChange={(v) => { setSort(v); setPage(1); }} options={[
          { value: "newest", label: "Newest First" },
          { value: "oldest", label: "Oldest First" }
        ]} />
      </FilterBar>

      <TableContainer>
        <thead>
          <tr>
            <Th>Application #</Th>
            <Th>Applicant Name</Th>
            <Th>Document Type</Th>
            <Th>Reason</Th>
            <Th>Police Report #</Th>
            <Th>Date Submitted</Th>
            <Th>Status</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {paginated.length === 0 ? (
            <tr><Td className="py-12 text-center" colSpan={8}><EmptyState icon={FileSearch} title="No applications found" /></Td></tr>
          ) : paginated.map((app) => (
            <tr key={app.id} className="hover:bg-muted/30 transition-colors">
              <Td><span className="font-mono text-[13px]">{app.applicationNumber}</span></Td>
              <Td className="font-medium">{app.applicantName}</Td>
              <Td>{app.documentType}</Td>
              <Td className="text-muted-foreground truncate max-w-[150px]">{app.reason}</Td>
              <Td><span className="font-mono text-xs">{app.policeReport.reportNumber}</span></Td>
              <Td><span className="text-muted-foreground">{format(new Date(app.dateSubmitted), "dd MMM yyyy")}</span></Td>
              <Td><StatusBadge status={app.status} /></Td>
              <Td className="text-right">
                <Link href={`/applications/document-recovery/${app.id}`} className="text-xs font-medium text-primary hover:underline">
                  View Details
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableContainer>

      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </div>
  );
}