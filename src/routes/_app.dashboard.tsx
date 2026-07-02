import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { FileText, IdCard, FileSearch, CheckCircle2, Clock, XCircle, FileStack, TrendingUp, ArrowRight } from "lucide-react";
import { StatisticsCard } from "@/components/common/StatisticsCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Registrar General Zimbabwe" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const apps = useApps();
  const stationId = useUserStation();
  const birth = useMemo(() => filterByStation(apps.birth, stationId), [apps.birth, stationId]);
  const nationalId = useMemo(() => filterByStation(apps.nationalId, stationId), [apps.nationalId, stationId]);
  const recovery = useMemo(() => filterByStation(apps.recovery, stationId), [apps.recovery, stationId]);
  const all = useMemo(() => [...birth, ...nationalId, ...recovery], [birth, nationalId, recovery]);

  const total = all.length;
  const pending = all.filter((a) => a.status === "Pending").length;
  const approved = all.filter((a) => a.status === "Approved").length;
  const rejected = all.filter((a) => a.status === "Rejected").length;

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of all) {
      const k = format(new Date(a.dateSubmitted), "MMM");
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].map(([month, count]) => ({ month, count })).reverse();
  }, [all]);

  const categories = [
    { name: "Birth Certificates", value: birth.length, color: "#0A3D91" },
    { name: "National IDs", value: nationalId.length, color: "#D4AF37" },
    { name: "Recovery", value: recovery.length, color: "#5B7BBA" },
  ];

  const rate = total === 0 ? [] : [
    { name: "Approval Rate", value: Math.round((approved / total) * 100), fill: "#10b981" },
  ];

  const recent = [...all]
    .sort((a, b) => +new Date(b.dateSubmitted) - +new Date(a.dateSubmitted))
    .slice(0, 6);

  return (
    <div>
      <PageHeader title="Operations Dashboard" description="Live overview of citizen document applications." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard label="Total Applications" value={total} icon={FileStack} tone="gov" />
        <StatisticsCard label="Pending" value={pending} icon={Clock} tone="warning" />
        <StatisticsCard label="Approved" value={approved} icon={CheckCircle2} tone="success" />
        <StatisticsCard label="Rejected" value={rejected} icon={XCircle} tone="danger" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatisticsCard label="Birth Certificate Requests" value={birth.length} icon={FileText} hint="Across all branches" />
        <StatisticsCard label="National ID Requests" value={nationalId.length} icon={IdCard} hint="New & renewal" />
        <StatisticsCard label="Document Recovery" value={recovery.length} icon={FileSearch} hint="Lost or damaged" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Monthly Applications</h3>
              <p className="text-sm text-muted-foreground">Volume of submissions over time</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> Trending
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#0A3D91" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Application Categories</h3>
          <p className="text-sm text-muted-foreground">Distribution by type</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3}>
                  {categories.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Approval Rate</h3>
          <p className="text-sm text-muted-foreground">Approved vs total processed</p>
          <div className="mt-4 flex items-center justify-center">
            <div className="grid h-44 w-44 place-items-center rounded-full"
              style={{ background: `conic-gradient(#10b981 ${(rate[0]?.value ?? 0) * 3.6}deg, var(--muted) 0)` }}>
              <div className="grid h-32 w-32 place-items-center rounded-full bg-card">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold">{rate[0]?.value ?? 0}%</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Daily Submissions (last 14 days)</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.from({ length: 14 }, (_, i) => ({
                day: i + 1,
                value: Math.round(8 + Math.sin(i / 2) * 4 + (i % 4)),
              }))}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-lg font-bold">Recent Applications</h3>
          <Link to="/applications/birth-certificates" className="inline-flex items-center gap-1 text-sm font-medium text-gov hover:underline dark:text-primary">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Application #</th>
                <th className="px-5 py-3 font-medium">Applicant</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((a) => {
                const path =
                  a.type === "Birth Certificate" ? "/applications/birth-certificates/$id"
                    : a.type === "National ID" ? "/applications/national-id/$id"
                      : "/applications/document-recovery/$id";
                return (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{a.applicationNumber}</td>
                    <td className="px-5 py-3 font-medium">{a.applicantName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{a.type}</td>
                    <td className="px-5 py-3 text-muted-foreground">{format(new Date(a.dateSubmitted), "dd MMM yyyy")}</td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Link to={path} params={{ id: a.id }} className="text-gov hover:underline dark:text-primary">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}