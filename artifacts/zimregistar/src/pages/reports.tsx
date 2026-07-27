import { useAuth } from "@/lib/store";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { BarChart3, FileText, CheckCircle, XCircle, Clock, Download, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportsPage() {
  const { user } = useAuth();
  
  if (user?.role === "Registrar Officer") {
    return (
      <div className="space-y-6 pb-10">
        <PageHeader title="Reports & Analytics" />
        <div className="border border-border bg-card p-12">
          <EmptyState icon={ShieldAlert} title="Access Restricted" description="You do not have permission to view administrative reports." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Reports & Analytics" 
        description="System-wide performance and processing metrics."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> PDF</Button>
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Excel</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <StatCard label="Total Processed (YTD)" value="12,450" icon={FileText} />
        <StatCard label="Approved (YTD)" value="10,210" icon={CheckCircle} tone="emerald" />
        <StatCard label="Rejected (YTD)" value="2,240" icon={XCircle} tone="red" />
        <StatCard label="Avg Processing Time" value="3.2 days" icon={Clock} />
        <StatCard label="Daily Target Met" value="94%" icon={BarChart3} tone="primary" />
        <StatCard label="Printing Backlog" value="142" icon={Clock} tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <div className="border border-border bg-card p-5 h-80 flex flex-col">
          <h3 className="text-sm font-semibold mb-6">Processing Volume by District</h3>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            [Chart Area: Horizontal Bar Chart]
          </div>
        </div>
        <div className="border border-border bg-card p-5 h-80 flex flex-col">
          <h3 className="text-sm font-semibold mb-6">Approval vs Rejection Trends</h3>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            [Chart Area: Stacked Area Chart]
          </div>
        </div>
      </div>
    </div>
  );
}