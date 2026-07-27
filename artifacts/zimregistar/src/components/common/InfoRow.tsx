import type { ReactNode } from "react";
export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="py-2.5 border-b border-border/60 last:border-b-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}