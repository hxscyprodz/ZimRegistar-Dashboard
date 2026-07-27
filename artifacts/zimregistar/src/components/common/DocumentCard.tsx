import { useState } from "react";
import { ZoomIn, X, Download } from "lucide-react";
export function DocumentCard({ label, src }: { label: string; src?: string }) {
  const [zoom, setZoom] = useState(false);
  if (!src) return <div className="border border-border p-3 text-center text-xs text-muted-foreground">{label}<br/><span className="opacity-60">Not provided</span></div>;
  return (
    <>
      <div className="group relative cursor-pointer overflow-hidden border border-border bg-muted" onClick={() => setZoom(true)}>
        <img src={src} alt={label} className="h-32 w-full object-cover transition group-hover:opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
          <ZoomIn className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />
        </div>
        <div className="border-t border-border bg-card px-2 py-1.5">
          <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setZoom(false)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={src} alt={label} className="w-full max-h-[80vh] object-contain" />
            <button className="absolute -top-8 right-0 text-white/80 hover:text-white" onClick={() => setZoom(false)}><X className="h-5 w-5" /></button>
            <a href={src} download className="absolute -bottom-8 left-0 text-white/80 hover:text-white text-xs flex items-center gap-1"><Download className="h-3.5 w-3.5" /> Download</a>
          </div>
        </div>
      )}
    </>
  );
}