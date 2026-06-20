import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useApps } from "@/lib/store";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — Registrar General" }] }),
  component: Reports,
});

function Reports() {
  const { birth, nationalId, recovery } = useApps();
  const all = [...birth, ...nationalId, ...recovery];
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const daily = all.filter((a) => +new Date(a.dateSubmitted) >= +today).length;
  const weekly = all.filter((a) => +new Date(a.dateSubmitted) >= Date.now() - 7 * 86400000).length;
  const monthly = all.filter((a) => +new Date(a.dateSubmitted) >= Date.now() - 30 * 86400000).length;
  const approved = all.filter((a) => a.status === "Approved").length;
  const rejected = all.filter((a) => a.status === "Rejected").length;
  const printed = [...birth, ...nationalId, ...recovery].filter((a) => a.printStatus === "Printed").length;

  const byType = [
    { name: "Birth", value: birth.length, color: "#0A3D91" },
    { name: "National ID", value: nationalId.length, color: "#D4AF37" },
    { name: "Recovery", value: recovery.length, color: "#5B7BBA" },
  ];

  const trend = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const day = new Date(Date.now() - (29 - i) * 86400000);
    const count = all.filter((a) => {
      const d = new Date(a.dateSubmitted);
      return d.getDate() === day.getDate() && d.getMonth() === day.getMonth();
    }).length;
    return { day: format(day, "dd"), count };
  }), [all]);

  const stats = [
    { label: "Daily", value: daily },
    { label: "Weekly", value: weekly },
    { label: "Monthly", value: monthly },
    { label: "Approved", value: approved },
    { label: "Rejected", value: rejected },
    { label: "Printed", value: printed },
  ];

  const exportCSV = () => {
    const rows = [["Application #", "Applicant", "Type", "Status", "Submitted"]];
    for (const a of all) rows.push([a.applicationNumber, a.applicantName, a.type, a.status, a.dateSubmitted]);
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "rg-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Operational insights across all application categories."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.info("PDF export queued")}><FileText className="mr-2 h-4 w-4" />PDF</Button>
            <Button variant="outline" onClick={() => toast.info("Excel export queued")}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button>
            <Button onClick={exportCSV}><Download className="mr-2 h-4 w-4" />CSV</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="font-display text-lg font-bold">Submissions — last 30 days</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A3D91" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0A3D91" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="day" /><YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0A3D91" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">By Category</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byType} dataKey="value" outerRadius={90}>
                  {byType.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Legend /><Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-display text-lg font-bold">Approval vs Rejection</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={[
              { name: "Birth", Approved: birth.filter((a) => a.status === "Approved").length, Rejected: birth.filter((a) => a.status === "Rejected").length },
              { name: "National ID", Approved: nationalId.filter((a) => a.status === "Approved").length, Rejected: nationalId.filter((a) => a.status === "Rejected").length },
              { name: "Recovery", Approved: recovery.filter((a) => a.status === "Approved").length, Rejected: recovery.filter((a) => a.status === "Rejected").length },
            ]}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" /><YAxis allowDecimals={false} />
              <Tooltip /><Legend />
              <Bar dataKey="Approved" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Rejected" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
