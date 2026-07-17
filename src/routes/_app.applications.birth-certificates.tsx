import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, FileText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusFilter, SortBy } from "@/components/common/AppFilters";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import { format } from "date-fns";
import type { BirthCertificateApp } from "@/lib/types";

export const Route = createFileRoute("/_app/applications/birth-certificates")({
  head: () => ({ meta: [{ title: "Birth Certificate Applications" }] }),
  component: BirthCertificateRoute,
});

function BirthCertificateRoute() {
  const matchRoute = useMatchRoute();
  const isDetailRoute = Boolean(
    matchRoute({ to: "/applications/birth-certificates/$id", fuzzy: true }),
  );

  return isDetailRoute ? <Outlet /> : <BirthCertList />;
}

function BirthCertList() {
  const birthAll = useApps((s) => s.birth);
  const stationId = useUserStation();
  const list = useMemo(() => filterByStation(birthAll, stationId), [birthAll, stationId]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    let filteredList = list.filter(
      (a) =>
        (status === "All" || a.status === status) &&
        (q === "" ||
          a.firstName.toLowerCase().includes(q.toLowerCase()) ||
          a.applicationId.toLowerCase().includes(q.toLowerCase())),
    );
    filteredList = [...filteredList].sort((a, b) => {
      if (sort === "date-desc") return +new Date(b.applicationDate) - +new Date(a.applicationDate);
      if (sort === "date-asc") return +new Date(a.applicationDate) - +new Date(b.applicationDate);
      if (sort === "name-asc") return a.firstName.localeCompare(b.firstName);
      return b.firstName.localeCompare(a.firstName);
    });
    return filteredList;
  }, [list, q, status, sort]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader
        title="Birth Certificate Applications"
        description="Review, approve and reject birth certificate requests submitted by citizens."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchBar
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Search by name or application #"
        />
        <StatusFilter
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <SortBy
          value={sort}
          onChange={setSort}
          options={[
            { value: "date-desc", label: "Newest first" },
            { value: "date-asc", label: "Oldest first" },
            { value: "name-asc", label: "Name A–Z" },
            { value: "name-desc", label: "Name Z–A" },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Application #</th>
                <th className="px-5 py-3 font-medium">Applicant Name</th>
                <th className="px-5 py-3 font-medium">Date Submitted</th>
                <th className="px-5 py-3 font-medium">Place of Birth</th>
                <th className="px-5 py-3 font-medium">Parents</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((a) => (
                <tr key={a._id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{a.applicationId}</td>
                  <td className="px-5 py-3 font-medium">
                    {a.firstName} {a.surname}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {format(new Date(a.applicationDate), "dd MMM yyyy")}
                  </td>
                  <td className="px-5 py-3">{a.placeOfBirth}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {a.father.firstName} {a.father.surname} & {a.mother.firstName}{" "}
                    {a.mother.surname}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link to="/applications/birth-certificates/$id" params={{ id: a._id }}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1.5 h-4 w-4" /> View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No applications found"
                description="Try adjusting your search or filters."
              />
            </div>
          ) : null}
        </div>
        <div className="px-5 pb-4 pt-3">
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
