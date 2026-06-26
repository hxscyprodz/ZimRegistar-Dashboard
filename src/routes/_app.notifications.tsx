import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCircle2, FileText, IdCard, FileSearch } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useApps } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const birth = useApps((s) => s.birth);
  const nationalId = useApps((s) => s.nationalId);
  const recovery = useApps((s) => s.recovery);

  type Item = {
    id: string;
    title: string;
    description: string;
    date: string;
    icon: typeof Bell;
    to: string;
    params: Record<string, string>;
    tone: "pending" | "approved" | "rejected";
  };

  const items: Item[] = [
    ...birth.map<Item>((a) => ({
      id: `b-${a.id}`,
      title: `Birth Certificate · ${a.applicationNumber}`,
      description: `${a.child.firstName} ${a.child.lastName} — ${a.status}`,
      date: a.dateSubmitted,
      icon: FileText,
      to: "/applications/birth-certificates/$id",
      params: { id: a.id },
      tone: a.status === "Approved" ? "approved" : a.status === "Rejected" ? "rejected" : "pending",
    })),
    ...nationalId.map<Item>((a) => ({
      id: `n-${a.id}`,
      title: `National ID · ${a.applicationNumber}`,
      description: `${a.applicant.firstName} ${a.applicant.lastName} — ${a.status}`,
      date: a.dateSubmitted,
      icon: IdCard,
      to: "/applications/national-id/$id",
      params: { id: a.id },
      tone: a.status === "Approved" ? "approved" : a.status === "Rejected" ? "rejected" : "pending",
    })),
    ...recovery.map<Item>((a) => ({
      id: `r-${a.id}`,
      title: `Document Recovery · ${a.applicationNumber}`,
      description: `${a.applicant.firstName} ${a.applicant.lastName} — ${a.status}`,
      date: a.dateSubmitted,
      icon: FileSearch,
      to: "/applications/document-recovery/$id",
      params: { id: a.id },
      tone: a.status === "Approved" ? "approved" : a.status === "Rejected" ? "rejected" : "pending",
    })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div>
      <PageHeader title="Notifications Center" description="Recent activity across all application modules." />
      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          <Bell className="mx-auto mb-2 h-6 w-6 opacity-60" />
          No notifications yet.
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {items.slice(0, 50).map((n) => {
            const Icon = n.icon;
            const tone =
              n.tone === "approved"
                ? "text-emerald-600 bg-emerald-500/10"
                : n.tone === "rejected"
                ? "text-destructive bg-destructive/10"
                : "text-amber-600 bg-amber-500/10";
            return (
              <li key={n.id}>
                <Link
                  to={n.to}
                  params={n.params}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/60"
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}>
                    {n.tone === "approved" ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.date), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}