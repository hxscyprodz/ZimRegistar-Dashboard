import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Ban, Moon, Bell, Shield, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUI, useAuth, type StaffMember, type Role } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listStaffApi,
  listStationsApi,
  createStaffApi,
  updateStaffApi,
  toggleStaffActiveApi,
  deleteStaffApi,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings" }] }),
  component: Settings,
});

type StaffMemberDraft = Omit<StaffMember, "_id" | "staffId" | "status">;

function Settings() {
  const { dark, toggleDark } = useUI();
  const user = useAuth((s) => s.user);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stations, setStations] = useState<{ _id: string; stationName: string }[]>([]);
  const [refetchCount, setRefetchCount] = useState(0);
  const forceRefetch = () => setRefetchCount((c) => c + 1);
  const isAdmin = user?.role === "Administrator";
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StaffMemberDraft>({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    nationalIdNumber: "",
    role: "Registrar Officer",
    stationId: "",
    password: "",
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    listStaffApi().then((res) => {
      setStaff(res.data);
    });
  }, [refetchCount]);

  useEffect(() => {
    listStationsApi().then((res) => setStations(res.data));
  }, []);

  const openAdd = () => {
    if (!isAdmin) {
      toast.error("Only Administrators can add staff.");
      return;
    }
    setDraft({
      firstName: "",
      surname: "",
      email: "",
      phone: "",
      nationalIdNumber: "",
      role: "Registrar Officer",
      stationId: user?.stationId ?? stations[0]?._id ?? "",
      password: "",
    });
    setAddOpen(true);
  };

  const openEdit = (s: StaffMember) => {
    if (!isAdmin) {
      toast.error("Only Administrators can edit staff.");
      return;
    }
    setEditingId(s._id);
    setDraft({
      firstName: s.firstName,
      surname: s.surname,
      email: s.email,
      phone: s.phone,
      nationalIdNumber: s.nationalIdNumber,
      role: s.role,
      stationId: s.stationId,
      password: "", // Always clear password on edit
    });
  };

  const validate = (d: StaffMemberDraft, mode: "add" | "edit") => {
    if (!d.firstName.trim() || !d.surname.trim()) return "First and last name are required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return "Enter a valid email address.";
    if (!d.phone.trim()) return "Phone number is required.";
    if (!d.nationalIdNumber.trim()) return "National ID is required.";
    if (d.role !== "Super Administrator" && !d.stationId.trim()) return "Please assign a station.";
    if (mode === "add" && d.password.length < 4) return "Password must be at least 4 characters.";
    if (mode === "edit" && d.password && d.password.length < 4)
      return "Password must be at least 4 characters.";
    return null;
  };

  const submitAdd = async () => {
    const err = validate(draft, "add");
    if (err) return toast.error(err);
    try {
      await createStaffApi(draft);
      setAddOpen(false);
      forceRefetch();
      toast.success("Staff member added successfully.");
    } catch (error) {
      toast.error("Failed to add staff member.");
    }
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const err = validate(draft, "edit");
    if (err) return toast.error(err);
    try {
      const payload = { ...draft };
      if (!payload.password) delete (payload as Partial<StaffMemberDraft>).password;
      await updateStaffApi(editingId, payload);
      setEditingId(null);
      forceRefetch();
      toast.success("Staff member updated successfully.");
    } catch (error) {
      toast.error("Failed to update staff member.");
    }
  };

  const requestDelete = () => {
    if (!isAdmin || !editingId) return;
    setConfirmDeleteId(editingId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteStaffApi(confirmDeleteId);
      setConfirmDeleteId(null);
      setEditingId(null);
      forceRefetch();
      toast.success("Staff member deleted.");
    } catch (error) {
      toast.error("Failed to delete staff member.");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStaffActiveApi(id);
      forceRefetch();
      toast.success(currentStatus ? "Staff member suspended." : "Staff member reactivated.");
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  // Administrators only see staff at their own station.
  const visibleStaff = useMemo(
    () =>
      user?.role === "Administrator" ? staff.filter((s) => s.stationId === user.stationId) : staff,
    [staff, user],
  );

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
                <Button size="sm" onClick={openAdd} disabled={!isAdmin}>
                  <Plus className="mr-2 h-4 w-4" /> Add Staff
                </Button>
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
                    <tr key={s._id}>
                      <td className="px-5 py-3 font-medium">
                        {s.firstName} {s.surname}
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{s.staffId}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {s.phone}
                        <div className="font-mono">{s.nationalIdNumber}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gov/10 px-2 py-0.5 text-xs font-medium text-gov dark:bg-primary/15 dark:text-primary">
                          <Shield className="h-3 w-3" /> {s.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {stations.find((st) => st._id === s.stationId)?.stationName ?? s.stationId}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {s.status ? (
                          <span className="text-emerald-600">Active</span>
                        ) : (
                          <span className="text-muted-foreground">Suspended</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!isAdmin}
                          onClick={() => openEdit(s)}
                          title={isAdmin ? "Edit" : "Admins only"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          disabled={!isAdmin}
                          onClick={() => handleToggleActive(s._id, s.status)}
                        >
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
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display font-bold">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Reduce glare for late shifts.</p>
              </div>
            </div>
            <Switch checked={dark} onCheckedChange={() => toggleDark()} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display font-bold">Notification Preferences</p>
                <p className="text-xs text-muted-foreground">
                  Choose how you'd like to be alerted.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">In-app push notifications</span>
                <Switch checked={notifPush} onCheckedChange={setNotifPush} />
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <MyProfile staff={staff} onUpdate={forceRefetch} />
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
        onOpenChange={(v) => {
          if (!v) setEditingId(null);
        }}
        onSubmit={submitEdit}
        submitLabel="Save changes"
        onDelete={isAdmin && editingId ? requestDelete : undefined}
        mode="edit"
        stations={stations}
        lockStation={user?.role === "Administrator"}
      />
      <ConfirmModal
        open={!!confirmDeleteId}
        onOpenChange={(v) => {
          if (!v) setConfirmDeleteId(null);
        }}
        title="Delete staff member?"
        description="This action cannot be undone. The user will lose access immediately."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function MyProfile({ staff, onUpdate }: { staff: StaffMember[]; onUpdate: () => void }) {
  const user = useAuth((s) => s.user);
  const me = staff.find((s) => s.staffId === user?.employeeNumber);
  const [phone, setPhone] = useState(me?.phone ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (me) {
      setPhone(me.phone);
    }
  }, [me]);

  if (!user || !me) {
    return <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>;
  }

  const save = async () => {
    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }
    if (password && password.length < 6) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      const payload: Partial<StaffMember> = { phone: phone.trim() };
      if (password) {
        payload.password = password;
      }
      await updateStaffApi(me._id, payload);
      onUpdate();
      setPassword("");
      setConfirm("");
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gov text-xl font-bold text-gov-foreground">
            {user.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-display text-lg font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground">
              {user.role} · Employee {user.employeeNumber}
            </p>
            <p className="text-xs text-muted-foreground">{me.email}</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-display font-bold">Edit my details</h3>
        <p className="text-xs text-muted-foreground">
          You can update your phone number and password. For other changes, contact an
          Administrator.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Phone number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+263 ..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
            />
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
  open,
  title,
  draft,
  setDraft,
  onOpenChange,
  onSubmit,
  submitLabel,
  onDelete,
  mode = "edit",
  stations,
  lockStation,
}: {
  open: boolean;
  title: string;
  draft: StaffMemberDraft;
  setDraft: (d: StaffMemberDraft) => void;
  onOpenChange: (v: boolean) => void;
  onSubmit: () => void;
  submitLabel: string;
  onDelete?: () => void;
  mode?: "add" | "edit";
  stations: { _id: string; stationName: string }[];
  lockStation?: boolean;
}) {
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Fill in the details for the new staff member."
              : "Update the staff member's details."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input value={draft.firstName} onChange={(e) => set({ firstName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input value={draft.surname} onChange={(e) => set({ surname: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone number</Label>
            <Input
              value={draft.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="+263 ..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>National ID</Label>
            <Input
              value={draft.nationalIdNumber}
              onChange={(e) => set({ nationalIdNumber: e.target.value })}
              placeholder="63-1234567-A-12"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => set({ email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Employee number</Label>
            <Input
              value={mode === "edit" ? (draft as StaffMember).staffId : ""}
              disabled
              readOnly
              placeholder="Auto-generated"
            />
            <p className="text-[11px] text-muted-foreground">
              {mode === "add" ? "Auto-generated on save." : "Employee number cannot be changed."}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={draft.role} onValueChange={(v) => set({ role: v as Role })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Registrar Officer">Registrar Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Station</Label>
            <Select
              value={draft.stationId}
              onValueChange={(v) => set({ stationId: v })}
              disabled={lockStation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign a station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((st) => (
                  <SelectItem key={st._id} value={st._id}>
                    {st.stationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lockStation ? (
              <p className="text-[11px] text-muted-foreground">
                Administrators can only manage staff at their own station.
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Password</Label>
            <Input
              type="text"
              value={draft.password}
              onChange={(e) => set({ password: e.target.value })}
              placeholder="Min 4 characters"
            />
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>{submitLabel}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
