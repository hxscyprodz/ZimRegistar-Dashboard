import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function DataCard({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("border border-border bg-card", className)}>
      {title && <div className="border-b border-border px-5 py-3"><h3 className="text-sm font-semibold text-foreground">{title}</h3></div>}
      <div className="p-5">{children}</div>
    </div>
  );
}