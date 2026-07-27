import type { ReactNode } from "react";
export function TableContainer({ children }: { children: ReactNode }) {
  return (
    <div className="border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return <th className={`px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground bg-muted/60 ${right ? "text-right" : ""}`}>{children}</th>;
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}