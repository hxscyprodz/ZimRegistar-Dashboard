import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "primary" | "amber" | "emerald" | "red";

const borderColors: Record<Tone, string> = {
  default: "border-l-border",
  primary: "border-l-primary",
  amber: "border-l-amber-500",
  emerald: "border-l-emerald-500",
  red: "border-l-red-500",
};

const valueColors: Record<Tone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  amber: "text-amber-700 dark:text-amber-400",
  emerald: "text-emerald-700 dark:text-emerald-400",
  red: "text-red-700 dark:text-red-400",
};

export function StatCard({ label, value, icon: Icon, tone = "default", hint }: {
  label: string; value: string | number; icon: LucideIcon; tone?: Tone; hint?: string;
}) {
  return (
    <div className={cn("border-l-[3px] bg-card border border-border p-5 transition-shadow hover:shadow-sm", borderColors[tone])}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
          <p className={cn("mt-1.5 font-mono text-[28px] font-bold leading-none tabular-nums", valueColors[tone])}>{value}</p>
          {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        <div className="shrink-0 text-muted-foreground/50 mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}