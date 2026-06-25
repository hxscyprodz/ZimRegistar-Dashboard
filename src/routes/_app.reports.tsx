import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download, FileSpreadsheet, FileText, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useApps, useAuth } from "@/lib/store";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — Registrar General" }] }),
  component: Reports,
});

function Reports() {
  const role = useAuth((s) => s.user?.role);
  if (role === "Registrar Officer") {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="font-display text-xl font-bold">Access restricted</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The Reports module is available to Supervisors and Administrators only.
        </p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-medium text-gov hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

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

  const exportExcel = () => {
    const header = ["Application #", "Applicant", "Type", "Status", "Submitted"];
    const escape = (v: string) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const rows = all
      .map(
        (a) =>
          `<tr><td>${escape(a.applicationNumber)}</td><td>${escape(a.applicantName)}</td><td>${escape(a.type)}</td><td>${escape(
            a.status,
          )}</td><td>${escape(format(new Date(a.dateSubmitted), "yyyy-MM-dd"))}</td></tr>`,
      )
      .join("");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8" /></head><body><table border="1"><thead><tr>${header
      .map((h) => `<th>${h}</th>`)
      .join("")}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rg-report-${format(new Date(), "yyyyMMdd-HHmm")}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel file downloaded");
  };

  const exportPDF = () => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      toast.error("Pop-up blocked — allow pop-ups to export PDF");
      return;
    }
    const rowsHtml = all
      .map(
        (a) =>
          `<tr><td>${a.applicationNumber}</td><td>${a.applicantName}</td><td>${a.type}</td><td>${a.status}</td><td>${format(
            new Date(a.dateSubmitted),
            "dd MMM yyyy",
          )}</td></tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><title>RG Report ${format(new Date(), "yyyy-MM-dd")}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:32px;}
        h1{color:#0A3D91;margin:0 0 4px;font-size:22px;}
        .sub{color:#555;font-size:12px;margin-bottom:20px;}
        .stats{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:20px;}
        .stat{border:1px solid #ddd;padding:8px;border-radius:6px;}
        .stat b{display:block;font-size:18px;color:#0A3D91;}
        table{width:100%;border-collapse:collapse;font-size:12px;}
        th{background:#0A3D91;color:#fff;text-align:left;padding:6px;}
        td{border:1px solid #e5e5e5;padding:6px;}
        tr:nth-child(even) td{background:#fafafa;}
        .seal{border-top:2px solid #D4AF37;margin-top:24px;padding-top:8px;font-size:11px;color:#666;}
      </style></head><body>
      <h1>Registrar General — Operations Report</h1>
      <div class="sub">Republic of Zimbabwe · Generated ${format(new Date(), "dd MMM yyyy, HH:mm")}</div>
      <div class="stats">
        ${stats.map((s) => `<div class="stat"><span>${s.label}</span><b>${s.value}</b></div>`).join("")}
      </div>
      <table><thead><tr><th>Application #</th><th>Applicant</th><th>Type</th><th>Status</th><th>Submitted</th></tr></thead>
      <tbody>${rowsHtml}</tbody></table>
      <div class="seal">Official report — Registrar General's Office. Use browser "Save as PDF" in the print dialog.</div>
      <script>window.onload=()=>setTimeout(()=>window.print(),250);</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Operational insights across all application categories."
        actions={
          <>
            <Button variant="outline" onClick={exportPDF}><FileText className="mr-2 h-4 w-4" />PDF</Button>
            <Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button>
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
