import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "border-l-2 border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
    Approved: "border-l-2 border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
    Rejected: "border-l-2 border-red-500 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300",
    Printed: "border-l-2 border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
    "Not Printed": "border-l-2 border-slate-400 bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wide", map[status] ?? "border-l-2 border-muted bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
}