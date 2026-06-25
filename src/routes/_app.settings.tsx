import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Ban, Moon, Bell, Shield, Lock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUI, useAuth, useStaff, type StaffMember, type Role } from "@/lib/store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings" }] }),
  component: Settings,
});

type Draft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  employeeNumber: string;
  role: Role;
  password: string;
  active: boolean;
};

const emptyDraft = (): Draft => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nationalId: "",
  employeeNumber: "",
  role: "Registrar Officer",
  password: "",
  active: true,
});

function Settings() {
  const { dark, toggleDark } = useUI();
  const user = useAuth((s) => s.user);
  const { staff, addStaff, updateStaff, toggleActive } = useStaff();
  const isAdmin = user?.role === "Administrator";
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());

  const openAdd = () => {
    if (!isAdmin) {
      toast.error("Only Administrators can add staff.");
      return;
    }
    setDraft(emptyDraft());
    setAddOpen(true);
  };

  const openEdit = (s: StaffMember) => {
    if (!isAdmin) {
      toast.error("Only Administrators can edit staff.");
      return;
    }
    setEditingId(s.id);
    setDraft({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      nationalId: s.nationalId,
      employeeNumber: s.employeeNumber,
      role: s.role,
      password: s.password,
      active: s.active,
    });
  };

  const validate = (d: Draft) => {
    if (!d.firstName.trim() || !d.lastName.trim()) return "First and last name are required.";
    if (!d.employeeNumber.trim()) return "Employee number is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return "Enter a valid email address.";
    if (!d.phone.trim()) return "Phone number is required.";
    if (!d.nationalId.trim()) return "National ID is required.";
    if (d.password.length < 4) return "Password must be at least 4 characters.";
    return null;
  };

  const submitAdd = () => {
    const err = validate(draft);
    if (err) { toast.error(err); return; }
    if (staff.some((s) => s.employeeNumber.toLowerCase() === draft.employeeNumber.toLowerCase())) {
      toast.error("Employee number already exists.");
      return;
    }
    addStaff(draft);
    setAddOpen(false);
    toast.success(`${draft.firstName} ${draft.lastName} added`);
  };

  const submitEdit = () => {
    if (!editingId) return;
    const err = validate(draft);
    if (err) { toast.error(err); return; }
    updateStaff(editingId, draft);
    setEditingId(null);
    toast.success("Staff updated");
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage staff, roles, theme and notifications." />
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          {!isAdmin ? (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <Lock className="h-4 w-4" /> You are viewing staff in read-only mode. Only Administrators can add or edit staff.
            </div>
          ) : null}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="font-display font-bold">Staff Members</h3>
              <Button size="sm" onClick={openAdd} disabled={!isAdmin}><Plus className="mr-2 h-4 w-4" /> Add Staff</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Employee #</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-medium">
                      {s.firstName} {s.lastName}
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{s.employeeNumber}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {s.phone}
                      <div className="font-mono">{s.nationalId}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gov/10 px-2 py-0.5 text-xs font-medium text-gov dark:bg-primary/15 dark:text-primary">
                        <Shield className="h-3 w-3" /> {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs">{s.active ? <span className="text-emerald-600">Active</span> : <span className="text-muted-foreground">Suspended</span>}</td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="ghost" disabled={!isAdmin} onClick={() => openEdit(s)} title={isAdmin ? "Edit" : "Admins only"}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" disabled={!isAdmin} onClick={() => {
                        toggleActive(s.id);
                        toast.warning(s.active ? "Suspended" : "Reactivated");
                      }}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display font-bold">Roles</h3>
            <p className="text-sm text-muted-foreground">Privilege tiers within the system.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { name: "Administrator", desc: "Full access to all modules and settings." },
                { name: "Supervisor", desc: "Reviews officer decisions and runs reports." },
                { name: "Registrar Officer", desc: "Processes citizen applications." },
              ].map((r) => (
                <div key={r.name} className="rounded-lg border border-border p-4">
                  <p className="font-display font-bold">{r.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted"><Moon className="h-5 w-5" /></div>
              <div>
                <p className="font-display font-bold">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Reduce glare for late shifts.</p>
              </div>
            </div>
            <Switch checked={dark} onCheckedChange={() => toggleDark()} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted"><Bell className="h-5 w-5" /></div>
              <div>
                <p className="font-display font-bold">Notification Preferences</p>
                <p className="text-xs text-muted-foreground">Choose how you'd like to be alerted.</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between"><span className="text-sm">Email notifications</span><Switch checked={notifEmail} onCheckedChange={setNotifEmail} /></label>
              <label className="flex items-center justify-between"><span className="text-sm">In-app push notifications</span><Switch checked={notifPush} onCheckedChange={setNotifPush} /></label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gov text-xl font-bold text-gov-foreground">
                {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2) ?? "RG"}
              </div>
              <div>
                <p className="font-display text-lg font-bold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.role} · Employee {user?.employeeNumber}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <StaffDialog
        open={addOpen}
        title="Add Staff Member"
        draft={draft}
        setDraft={setDraft}
        onOpenChange={setAddOpen}
        onSubmit={submitAdd}
        submitLabel="Add staff"
      />
      <StaffDialog
        open={!!editingId}
        title="Edit Staff Member"
        draft={draft}
        setDraft={setDraft}
        onOpenChange={(v) => { if (!v) setEditingId(null); }}
        onSubmit={submitEdit}
        submitLabel="Save changes"
      />
    </div>
  );
}

function StaffDialog({
  open, title, draft, setDraft, onOpenChange, onSubmit, submitLabel,
}: {
  open: boolean;
  title: string;
  draft: Draft;
  setDraft: (d: Draft) => void;
  onOpenChange: (v: boolean) => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input value={draft.firstName} onChange={(e) => set({ firstName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input value={draft.lastName} onChange={(e) => set({ lastName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone number</Label>
            <Input value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+263 ..." />
          </div>
          <div className="space-y-1.5">
            <Label>National ID</Label>
            <Input value={draft.nationalId} onChange={(e) => set({ nationalId: e.target.value })} placeholder="63-1234567-A-12" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Email</Label>
            <Input type="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Employee number</Label>
            <Input value={draft.employeeNumber} onChange={(e) => set({ employeeNumber: e.target.value })} placeholder="RG-XXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={draft.role} onValueChange={(v) => set({ role: v as Role })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Registrar Officer">Registrar Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Password</Label>
            <Input type="text" value={draft.password} onChange={(e) => set({ password: e.target.value })} placeholder="Min 4 characters" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}