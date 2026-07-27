import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
export function RejectModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (reason: string) => void; }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setReason(""); setErr(""); } onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>A clear reason is required for audit purposes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Rejection Reason</Label>
          <Textarea id="reason" rows={4} value={reason} onChange={e => { setReason(e.target.value); if (err) setErr(""); }} placeholder="Provide a clear, specific reason for rejection." className="resize-none" />
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { if (reason.trim().length < 8) { setErr("Please provide a reason (at least 8 characters)."); return; } onConfirm(reason.trim()); setReason(""); }}>
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}