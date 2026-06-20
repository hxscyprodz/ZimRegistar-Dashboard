import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatisticsCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "gov" | "gold" | "success" | "danger" | "warning";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-card text-card-foreground",
    gov: "bg-gov text-gov-foreground",
    gold: "bg-gold text-gold-foreground",
    success: "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200",
    danger: "bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200",
    warning: "bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200",
  };
  return (
    <div className={cn("rounded-xl border border-border p-5 shadow-sm transition hover:shadow-md", tones[tone])}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {hint ? <p className="mt-1 text-xs opacity-70">{hint}</p> : null}
        </div>
        <div className="shrink-0 rounded-lg bg-black/10 p-2.5 dark:bg-white/10">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
