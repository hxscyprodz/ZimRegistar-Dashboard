import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, FileSearch } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusFilter, SortBy } from "@/components/common/AppFilters";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useApps } from "@/lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/applications/document-recovery")({
  head: () => ({ meta: [{ title: "Document Recovery Applications" }] }),
  component: RecoveryRoute,
});

function RecoveryRoute() {
  const matchRoute = useMatchRoute();
  const isDetail = Boolean(matchRoute({ to: "/applications/document-recovery/$id", fuzzy: true }));
  return isDetail ? <Outlet /> : <RecList />;
}

function RecList() {
  const list = useApps((s) => s.recovery);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = useMemo(() => {
    let r = list.filter((a) =>
      (status === "All" || a.status === status) &&
      (q === "" || a.applicantName.toLowerCase().includes(q.toLowerCase()) || a.applicationNumber.toLowerCase().includes(q.toLowerCase()))
    );
    r = [...r].sort((a, b) => {
      if (sort === "date-desc") return +new Date(b.dateSubmitted) - +new Date(a.dateSubmitted);
      if (sort === "date-asc") return +new Date(a.dateSubmitted) - +new Date(b.dateSubmitted);
      if (sort === "name-asc") return a.applicantName.localeCompare(b.applicantName);
      return b.applicantName.localeCompare(a.applicantName);
    });
    return r;
  }, [list, q, status, sort]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div>
      <PageHeader title="Document Recovery Applications" description="Replacement requests for lost or damaged documents." />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search…" />
        <StatusFilter value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        <SortBy value={sort} onChange={setSort} options={[
          { value: "date-desc", label: "Newest first" },
          { value: "date-asc", label: "Oldest first" },
          { value: "name-asc", label: "Name A–Z" },
          { value: "name-desc", label: "Name Z–A" },
        ]} />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Application #</th>
                <th className="px-5 py-3 font-medium">Applicant</th>
                <th className="px-5 py-3 font-medium">Document Type</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{a.applicationNumber}</td>
                  <td className="px-5 py-3 font-medium">{a.applicantName}</td>
                  <td className="px-5 py-3">{a.documentType}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.reason}</td>
                  <td className="px-5 py-3 text-muted-foreground">{format(new Date(a.dateSubmitted), "dd MMM yyyy")}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <Link to="/applications/document-recovery/$id" params={{ id: a.id }}>
                      <Button size="sm" variant="outline"><Eye className="mr-1.5 h-4 w-4" /> View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 ? <div className="p-6"><EmptyState icon={FileSearch} title="No applications" /></div> : null}
        </div>
        <div className="px-5 pb-4 pt-3">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
