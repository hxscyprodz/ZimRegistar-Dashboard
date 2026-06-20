import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Maximize2, ZoomIn, ZoomOut } from "lucide-react";

export function DocumentCard({ label, src }: { label: string; src: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <button type="button" onClick={() => setOpen(true)} className="block w-full overflow-hidden">
          <img src={src} alt={label} className="h-44 w-full object-cover transition group-hover:scale-[1.02]" />
        </button>
        <div className="flex items-center justify-between border-t border-border p-3">
          <p className="truncate text-sm font-medium">{label}</p>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="Open">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <a href={src} download target="_blank" rel="noreferrer">
              <Button variant="ghost" size="icon" title="Download"><Download className="h-4 w-4" /></Button>
            </a>
          </div>
        </div>
      </div>
      <ImageViewer open={open} onOpenChange={setOpen} src={src} label={label} />
    </>
  );
}

export function ImageViewer({
  open, onOpenChange, src, label,
}: { open: boolean; onOpenChange: (v: boolean) => void; src: string; label: string }) {
  const [zoom, setZoom] = useState(1);
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setZoom(1); onOpenChange(v); }}>
      <DialogContent className="max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-base font-semibold">{label}</h3>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}><ZoomIn className="h-4 w-4" /></Button>
            <a href={src} download target="_blank" rel="noreferrer">
              <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
            </a>
          </div>
        </div>
        <div className="mt-3 max-h-[70vh] overflow-auto rounded-lg bg-muted">
          <img src={src} alt={label} style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} className="w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
