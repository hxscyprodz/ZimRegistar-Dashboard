import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, IdCard } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusFilter, SortBy } from "@/components/common/AppFilters";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/applications/national-id")({
  head: () => ({ meta: [{ title: "National ID Applications" }] }),
  component: NationalIdRoute,
});

function NationalIdRoute() {
  const matchRoute = useMatchRoute();
  const isDetailRoute = Boolean(matchRoute({ to: "/applications/national-id/$id", fuzzy: true }));

  return isDetailRoute ? <Outlet /> : <NIDList />;
}

function NIDList() {
  const listAll = useApps((s) => s.nationalId);
  const stationId = useUserStation();
  const list = useMemo(() => filterByStation(listAll, stationId), [listAll, stationId]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    let r = list.filter((a) =>
      (status === "All" || a.status === status) &&
      (q === "" ||
        a.applicantName.toLowerCase().includes(q.toLowerCase()) ||
        a.applicationNumber.toLowerCase().includes(q.toLowerCase()))
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
      <PageHeader title="National ID Applications" description="Process new and renewal National ID requests." />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search applicant or application #" />
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
                <th className="px-5 py-3 font-medium">First Name</th>
                <th className="px-5 py-3 font-medium">Last Name</th>
                <th className="px-5 py-3 font-medium">Date of Birth</th>
                <th className="px-5 py-3 font-medium">Gender</th>
                <th className="px-5 py-3 font-medium">Address</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{a.applicationNumber}</td>
                  <td className="px-5 py-3 font-medium">{a.applicant.firstName}</td>
                  <td className="px-5 py-3 font-medium">{a.applicant.lastName}</td>
                  <td className="px-5 py-3">{a.applicant.dateOfBirth}</td>
                  <td className="px-5 py-3">{a.applicant.gender}</td>
                  <td className="px-5 py-3 max-w-[18ch] truncate text-muted-foreground" title={a.applicant.address}>{a.applicant.address}</td>
                  <td className="px-5 py-3 text-muted-foreground">{format(new Date(a.dateSubmitted), "dd MMM yyyy")}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <Link to="/applications/national-id/$id" params={{ id: a.id }}>
                      <Button size="sm" variant="outline"><Eye className="mr-1.5 h-4 w-4" /> View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 ? <div className="p-6"><EmptyState icon={IdCard} title="No applications" /></div> : null}
        </div>
        <div className="px-5 pb-4 pt-3">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
