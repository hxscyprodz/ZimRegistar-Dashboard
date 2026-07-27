import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/common/PageHeader";
import { useApps, useUserStation, filterByStation } from "@/lib/store";
import { FileText, IdCard, FileSearch } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

export function NotificationsPage() {
  const stationId = useUserStation();
  const { birth, nationalId, recovery } = useApps();
  
  const all = [
    ...filterByStation(birth, stationId).filter(a => a.status === "Pending"),
    ...filterByStation(nationalId, stationId).filter(a => a.status === "Pending"),
    ...filterByStation(recovery, stationId).filter(a => a.status === "Pending")
  ].sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

  const getIcon = (type: string) => {
    if (type === "Birth Certificate") return <FileText className="h-5 w-5 text-blue-500" />;
    if (type === "National ID") return <IdCard className="h-5 w-5 text-emerald-500" />;
    return <FileSearch className="h-5 w-5 text-amber-500" />;
  };

  const getLink = (app: any) => {
    if (app.type === "Birth Certificate") return `/applications/birth-certificates/${app.id}`;
    if (app.type === "National ID") return `/applications/national-id/${app.id}`;
    return `/applications/document-recovery/${app.id}`;
  };

  return (
    <div className="space-y-6 pb-10 max-w-3xl">
      <PageHeader title="Notifications" description="Recent pending applications requiring your attention." />

      <div className="border border-border bg-card">
        {all.length === 0 ? (
          <EmptyState icon={CheckCircle} title="All caught up!" description="There are no pending applications in your queue." />
        ) : (
          <div className="divide-y divide-border/60">
            {all.map(app => (
              <Link key={app.id} href={getLink(app)} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="mt-1 bg-muted p-2 rounded-sm border border-border">
                  {getIcon(app.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">New {app.type} Application</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Application <span className="font-mono">{app.applicationNumber}</span> submitted by {app.applicantName}.</p>
                  <p className="text-xs text-muted-foreground/60 mt-2 uppercase tracking-wide">
                    {formatDistanceToNow(new Date(app.dateSubmitted), { addSuffix: true })}
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { CheckCircle } from "lucide-react";