import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (p: number) => void; }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-[12px] text-muted-foreground">{total} record{total !== 1 ? "s" : ""} · Page {page} of {pages}</p>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= pages} onClick={() => onPageChange(page + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}