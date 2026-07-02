import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Ban, Moon, Bell, Shield, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUI, useAuth, useStaff, useStations, nextEmployeeNumber, type StaffMember, type Role } from "@/lib/store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/common/ConfirmModal";
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
  stationId: string;
  password: string;
  active: boolean;
};

const emptyDraft = (defaultStation = ""): Draft => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nationalId: "",
  employeeNumber: "",
  role: "Registrar Officer",
  stationId: defaultStation,
  password: "",
  active: true,
});

function Settings() {
  const { dark, toggleDark } = useUI();
  const user = useAuth((s) => s.user);
  const { staff, addStaff, updateStaff, toggleActive, deleteStaff } = useStaff();
  const stations = useStations((s) => s.stations);
  const isAdmin = user?.role === "Administrator";
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    if (!isAdmin) {
      toast.error("Only Administrators can add staff.");
      return;
    }
    setDraft({
      ...emptyDraft(user?.stationId ?? stations[0]?.id ?? ""),
      employeeNumber: nextEmployeeNumber(staff),
    });
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
      stationId: s.stationId,
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
    if (!d.stationId.trim()) return "Please assign a station.";
    if (d.password.length < 4) return "Password must be at least 4 characters.";
    return null;
  };

  const submitAdd = () => {
    const err = validate(draft);
    if (err) { toast.error(err); return; }
    // Always auto-generate — never trust user input for employee number.
    const generated = nextEmployeeNumber(staff);
    // Registrar administrators can only create staff at their own station.
    const stationId = user?.role === "Administrator" ? (user?.stationId ?? draft.stationId) : draft.stationId;
    addStaff({ ...draft, stationId, employeeNumber: generated });
    setAddOpen(false);
    toast.success(`${draft.firstName} ${draft.lastName} added as ${generated}`);
  };

  const submitEdit = () => {
    if (!editingId) return;
    const err = validate(draft);
    if (err) { toast.error(err); return; }
    updateStaff(editingId, draft);
    setEditingId(null);
    toast.success("Staff updated");
  };

  const requestDelete = () => {
    if (!isAdmin || !editingId) return;
    setConfirmDeleteId(editingId);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteStaff(confirmDeleteId);
    setConfirmDeleteId(null);
    setEditingId(null);
    toast.success("Staff deleted");
  };

  // Administrators only see staff at their own station.
  const visibleStaff = user?.role === "Administrator"
    ? staff.filter((s) => s.stationId === user.stationId)
    : staff;

  return (
    <div>
      <PageHeader title="Settings" description="Manage staff, roles, theme and notifications." />
      <Tabs defaultValue={isAdmin ? "users" : "profile"}>
        <TabsList>
          {isAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        {isAdmin && (
        <TabsContent value="users" className="mt-4">
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
                  <th className="px-5 py-3 font-medium">Station</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleStaff.map((s) => (
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
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {stations.find((st) => st.id === s.stationId)?.name ?? s.stationId}
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
        )}

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
          <MyProfile />
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
        mode="add"
        stations={stations}
        lockStation={user?.role === "Administrator"}
      />
      <StaffDialog
        open={!!editingId}
        title="Edit Staff Member"
        draft={draft}
        setDraft={setDraft}
        onOpenChange={(v) => { if (!v) setEditingId(null); }}
        onSubmit={submitEdit}
        submitLabel="Save changes"
        onDelete={isAdmin && editingId ? requestDelete : undefined}
        mode="edit"
        stations={stations}
        lockStation={user?.role === "Administrator"}
      />
      <ConfirmModal
        open={!!confirmDeleteId}
        onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}
        title="Delete staff member?"
        description="This action cannot be undone. The user will lose access immediately."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function MyProfile() {
  const user = useAuth((s) => s.user);
  const { staff, updateStaff } = useStaff();
  const me = staff.find((s) => s.employeeNumber === user?.employeeNumber);
  const [phone, setPhone] = useState(me?.phone ?? "");
  const [password, setPassword] = useState(me?.password ?? "");
  const [confirm, setConfirm] = useState(me?.password ?? "");

  if (!user || !me) {
    return <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>;
  }

  const save = () => {
    if (!phone.trim()) { toast.error("Phone number is required."); return; }
    if (password.length < 4) { toast.error("Password must be at least 4 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    updateStaff(me.id, { phone: phone.trim(), password });
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gov text-xl font-bold text-gov-foreground">
            {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-display text-lg font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.role} · Employee {user.employeeNumber}</p>
            <p className="text-xs text-muted-foreground">{me.email}</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-display font-bold">Edit my details</h3>
        <p className="text-xs text-muted-foreground">You can update your phone number and password. For other changes, contact an Administrator.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Phone number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+263 ..." />
          </div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 4 characters" />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm password</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save}>Save changes</Button>
        </div>
      </div>
    </div>
  );
}

function StaffDialog({
  open, title, draft, setDraft, onOpenChange, onSubmit, submitLabel, onDelete, mode = "edit",
}: {
  open: boolean;
  title: string;
  draft: Draft;
  setDraft: (d: Draft) => void;
  onOpenChange: (v: boolean) => void;
  onSubmit: () => void;
  submitLabel: string;
  onDelete?: () => void;
  mode?: "add" | "edit";
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
            <Input value={draft.employeeNumber} disabled readOnly placeholder="Auto-generated" />
            <p className="text-[11px] text-muted-foreground">
              {mode === "add" ? "Auto-generated on save." : "Employee number cannot be changed."}
            </p>
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
        <DialogFooter className="sm:justify-between">
          <div>
            {onDelete ? (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete staff
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={onSubmit}>{submitLabel}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}