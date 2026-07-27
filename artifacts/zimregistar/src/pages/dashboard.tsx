import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { FileText, IdCard, FileSearch, CheckCircle2, Clock, XCircle, ChevronRight, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableContainer, Th, Td } from "@/components/common/TableContainer";
import { EmptyState } from "@/components/common/EmptyState";

const monthlyData = [
  { name: "Jan", apps: 400 },
  { name: "Feb", apps: 300 },
  { name: "Mar", apps: 550 },
  { name: "Apr", apps: 450 },
  { name: "May", apps: 600 },
  { name: "Jun", apps: 750 },
];

const dailyData = Array.from({ length: 14 }).map((_, i) => ({
  name: `Day ${i + 1}`,
  submissions: Math.floor(Math.random() * 50) + 10,
}));

export function DashboardPage() {
  const stationId = useUserStation();
  const rawBirth = useApps(s => s.birth);
  const rawNationalId = useApps(s => s.nationalId);
  const rawRecovery = useApps(s => s.recovery);

  const birth = filterByStation(rawBirth, stationId);
  const nationalId = filterByStation(rawNationalId, stationId);
  const recovery = filterByStation(rawRecovery, stationId);

  const allApps = [...birth, ...nationalId, ...recovery].sort(
    (a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
  );

  const total = allApps.length;
  const pending = allApps.filter(a => a.status === "Pending").length;
  const approved = allApps.filter(a => a.status === "Approved").length;
  const rejected = allApps.filter(a => a.status === "Rejected").length;

  const pieData = [
    { name: "Birth Certificates", value: birth.length, color: "#0F2342" },
    { name: "National ID", value: nationalId.length, color: "#B8912A" },
    { name: "Document Recovery", value: recovery.length, color: "#5B7BAA" },
  ];

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const recent = allApps.slice(0, 6);

  const getTypeLink = (app: any) => {
    if (app.type === "Birth Certificate") return `/applications/birth-certificates/${app.id}`;
    if (app.type === "National ID") return `/applications/national-id/${app.id}`;
    return `/applications/document-recovery/${app.id}`;
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Operations Dashboard"
        description="System overview and application processing metrics."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Applications" value={total} icon={FileText} tone="default" />
        <StatCard label="Pending Review" value={pending} icon={Clock} tone="amber" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Monthly Applications
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "4px", fontSize: "12px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                />
                <Bar dataKey="apps" fill="#0F2342" radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-card p-5 flex flex-col">
          <h3 className="text-sm font-semibold mb-2">Application Types</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "4px", fontSize: "12px" }}
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-6">Approval Rate</h3>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32 shrink-0 rounded-full border-[8px] border-muted flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full border-[8px] border-emerald-500"
                style={{ 
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, 
                  transform: `rotate(${approvalRate * 3.6}deg)`,
                  opacity: approvalRate > 0 ? 1 : 0
                }} 
              />
              <div className="text-center">
                <span className="text-3xl font-bold font-mono">{approvalRate}%</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Of {total} total applications processed
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-6">Recent Daily Submissions</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} dy={10} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "4px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="submissions" stroke="#B8912A" strokeWidth={2} dot={{ r: 3, fill: "#B8912A", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border px-5 py-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Applications</h3>
          <Link href="/notifications" className="text-xs font-medium text-primary hover:underline">View All</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={FileSearch} title="No recent applications found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <Th>Application #</Th>
                  <Th>Applicant Name</Th>
                  <Th>Type</Th>
                  <Th>Date Submitted</Th>
                  <Th>Status</Th>
                  <Th right>Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recent.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <Td><span className="font-mono text-[13px]">{app.applicationNumber}</span></Td>
                    <Td className="font-medium">{app.applicantName}</Td>
                    <Td>{app.type}</Td>
                    <Td><span className="text-muted-foreground">{format(new Date(app.dateSubmitted), "dd MMM yyyy")}</span></Td>
                    <Td><StatusBadge status={app.status} /></Td>
                    <Td className="text-right">
                      <Link href={getTypeLink(app)} className="inline-flex items-center text-xs font-medium text-primary hover:underline">
                        View <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}