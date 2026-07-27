import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export function ConfirmModal({ open, onOpenChange, title, description, confirmLabel = "Confirm", onConfirm, tone = "default", isConfirming }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string; confirmLabel?: string;
  onConfirm: () => void; tone?: "default" | "success" | "destructive"; isConfirming?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant={tone === "destructive" ? "destructive" : "default"}
            className={tone === "success" ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}
            onClick={() => { onConfirm(); onOpenChange(false); }}
            disabled={isConfirming}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}