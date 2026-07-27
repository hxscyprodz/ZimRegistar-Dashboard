import { useAuth } from "@/lib/store";
import { Redirect } from "wouter";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Users, Building2, Server, Activity } from "lucide-react";
import { DataCard } from "@/components/common/DataCard";

export function SuperAdminPage() {
  const { user } = useAuth();
  
  if (user?.role !== "Super Administrator") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Super Administrator Console" 
        description="System-wide management across all stations and provinces."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Active Stations" value="12" icon={Building2} />
        <StatCard label="Total Staff Users" value="145" icon={Users} />
        <StatCard label="System Uptime" value="99.9%" icon={Activity} tone="emerald" />
        <StatCard label="DB Sync Status" value="Healthy" icon={Server} tone="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <DataCard title="Station Overview">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase text-muted-foreground tracking-wider">
                <th className="text-left pb-2 font-semibold">Station ID</th>
                <th className="text-left pb-2 font-semibold">Name</th>
                <th className="text-right pb-2 font-semibold">Staff Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-3 font-mono">ST-HRE</td>
                <td className="py-3">Harare Central Registry</td>
                <td className="py-3 text-right">12</td>
              </tr>
              <tr>
                <td className="py-3 font-mono">ST-BYO</td>
                <td className="py-3">Bulawayo Central Registry</td>
                <td className="py-3 text-right">8</td>
              </tr>
              <tr>
                <td className="py-3 font-mono">ST-MUT</td>
                <td className="py-3">Mutare District Registry</td>
                <td className="py-3 text-right">6</td>
              </tr>
            </tbody>
          </table>
        </DataCard>
        
        <DataCard title="System Alerts">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Nightly Backup Completed</p>
                <p className="text-xs text-muted-foreground">Today at 02:00 AM</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">High Load on Print Server</p>
                <p className="text-xs text-muted-foreground">Yesterday at 14:30 PM</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">System Update v2.1 Applied</p>
                <p className="text-xs text-muted-foreground">Oct 12, 2023</p>
              </div>
            </div>
          </div>
        </DataCard>
      </div>
    </div>
  );
}