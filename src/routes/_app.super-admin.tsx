import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Users,
  FileStack,
  Crown,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatisticsCard } from "@/components/common/StatisticsCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAuth,
  useApps,
  useStations,
  useStaff,
  nextEmployeeNumber,
  type StaffMember,
  type Role,
} from "@/lib/store";
import {
  listStaffApi,
  createStaffApi,
  updateStaffApi,
  createStationApi,
  updateStationApi,
  deleteStationApi,
  listStationsApi,
  listProvincesApi,
  deleteStaffApi,
  toggleStaffActiveApi,
} from "@/lib/api";
import type { Province, Station } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/super-admin")({
  head: () => ({ meta: [{ title: "Super Administrator Console" }] }),
  component: SuperAdminPage,
});

function SuperAdminPage() {
  const user = useAuth((s) => s.user);
  if (user && user.role !== "Super Administrator") return <Navigate to="/dashboard" />;

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [refetchStaff, setRefetchStaff] = useState(0);
  const [refetchStations, setRefetchStations] = useState(0);

  useEffect(() => {
    listProvincesApi().then((res) => {
      setProvinces(res.data);
    });
  }, []);
  useEffect(() => {
    listStaffApi().then((res) => {
      setStaff(res.data);
    });
  }, [refetchStaff]);
  useEffect(() => {
    listStationsApi().then((res) => {
      setStations(res.data);
    });
  }, [refetchStations]);
  const forceRefetchStaff = () => setRefetchStaff((c) => c + 1);
  const forceRefetchStations = () => setRefetchStations((c) => c + 1);

  const { birth, nationalId, recovery } = useApps();
  const allApps = useMemo(
    () => [
      ...birth.map((a) => ({ ...a, kind: "Birth Certificate" as const })),
      ...nationalId.map((a) => ({ ...a, kind: "National ID" as const })),
      ...recovery.map((a) => ({ ...a, kind: "Document Recovery" as const })),
    ],
    [birth, nationalId, recovery],
  );

  const stationStats = useMemo(() => {
    return stations.map((st) => {
      const apps = allApps.filter((a) => a.stationId === st._id);
      return {
        station: st,
        total: apps.length,
        approved: apps.filter((a) => a.status === "Approved").length,
        rejected: apps.filter((a) => a.status === "Rejected").length,
        pending: apps.filter((a) => a.status === "Pending").length,
        employees: staff.filter((s) => s.stationId === st._id).length,
      };
    });
  }, [stations, allApps, staff]);

  const totals = useMemo(
    () => ({
      stations: stations.length,
      staff: staff.filter((s) => s.role !== "Super Administrator").length,
      apps: allApps.length,
      pending: allApps.filter((a) => a.status === "Pending").length,
    }),
    [stations, staff, allApps],
  );

  return (
    <div>
      <PageHeader
        title="Super Administrator Console"
        description="System-wide oversight across every registrar station."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
            <Crown className="h-3.5 w-3.5" /> {user?.name}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard label="Stations" value={totals.stations} icon={Building2} tone="gov" />
        <StatisticsCard label="Employees" value={totals.staff} icon={Users} tone="gold" />
        <StatisticsCard label="Total Applications" value={totals.apps} icon={FileStack} />
        <StatisticsCard
          label="Pending Review"
          value={totals.pending}
          icon={FileStack}
          tone="warning"
        />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-3">
                <h3 className="font-display font-bold">Per-Station Performance</h3>
                <p className="text-xs text-muted-foreground">
                  Read-only view of applications and staffing across the network.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Station</th>
                      <th className="px-5 py-3 font-medium">Location</th>
                      <th className="px-5 py-3 font-medium">Employees</th>
                      <th className="px-5 py-3 font-medium">Total</th>
                      <th className="px-5 py-3 font-medium">Pending</th>
                      <th className="px-5 py-3 font-medium">Approved</th>
                      <th className="px-5 py-3 font-medium">Rejected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stationStats.map((s) => (
                      <tr key={s.station.stationId}>
                        <td className="px-5 py-3">
                          <div className="font-medium">{s.station.stationName}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {s.station.stationId}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {s.station.location.town}
                          </div>
                          <div>
                            {provinces
                              .find((p) => p._id === s.station.location.province)
                              ?.districts.find((d) => d._id === s.station.location.district)
                              ?.name ?? s.station.location.district}
                            ,{" "}
                            {provinces.find((p) => p._id === s.station.location.province)?.name ??
                              s.station.location.province}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold">{s.employees}</td>
                        <td className="px-5 py-3 font-semibold">{s.total}</td>
                        <td className="px-5 py-3 text-amber-600">{s.pending}</td>
                        <td className="px-5 py-3 text-emerald-600">{s.approved}</td>
                        <td className="px-5 py-3 text-rose-600">{s.rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {stationStats.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      icon={Building2}
                      title="No stations yet"
                      description="Add a station to get started."
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stations" className="mt-4">
            <StationsTab
              stations={stations}
              forceRefetch={forceRefetchStations}
              provinces={provinces}
            />
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <StaffTab staff={staff} forceRefetch={forceRefetchStaff} stations={stations} />
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <ApplicationsTab stations={stations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Stations Tab ─────────────────────────────────────────────────────────

type StationDraft = Omit<Station, "_id" | "stationId">;

function StationsTab({
  stations,
  forceRefetch,
  provinces,
}: {
  stations: Station[];
  forceRefetch: () => void;
  provinces: Province[];
}) {
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draft, setDraft] = useState<StationDraft>({
    stationName: "",
    location: {
      province: "",
      district: "",
      town: "",
      address: "",
    },
    numberOfStaff: 0,
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const searchableStations = useMemo(() => {
    if (!provinces.length) return [];
    return stations.map((s) => {
      const province = provinces.find((p) => p._id === s.location.province);
      const provinceName = province?.name ?? "";
      const districtName =
        province?.districts.find((d) => d._id === s.location.district)?.name ?? "";
      return {
        ...s,
        provinceName,
        districtName,
      };
    });
  }, [stations, provinces]);

  const filtered = searchableStations.filter((s) => {
    if (q.trim() === "") return true;
    const searchTerm = q.toLowerCase();
    return (
      s.stationName.toLowerCase().includes(searchTerm) ||
      s.provinceName.toLowerCase().includes(searchTerm) ||
      s.districtName.toLowerCase().includes(searchTerm)
    );
  });

  const openAdd = () => {
    setDraft({
      stationName: "",
      location: { province: "", district: "", town: "", address: "" },
      numberOfStaff: 0,
    });
    setAddOpen(true);
  };
  const openEdit = (s: Station) => {
    setEditingId(s._id);
    setDraft({
      stationName: s.stationName,
      location: {
        province: s.location.province,
        district: s.location.district,
        town: s.location.town,
        address: s.location.address,
      },
      numberOfStaff: s.numberOfStaff,
    });
  };
  const validate = (d: StationDraft) => {
    if (!d.stationName.trim()) return "Station name is required.";
    if (!d.location.province.trim() || !d.location.district.trim() || !d.location.town.trim())
      return "Province, District, and Town are required.";
    if (!d.location.address.trim()) return "Address is required.";
    return null;
  };
  const submitAdd = async () => {
    const err = validate(draft);
    if (err) return toast.error(err);
    setIsSubmitting(true);
    try {
      await createStationApi(draft);
      setAddOpen(false);
      forceRefetch();
      toast.success("Station created successfully.");
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message ?? "Failed to add station.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const submitEdit = async () => {
    if (!editingId) return;
    const err = validate(draft);
    if (err) return toast.error(err);
    setIsSubmitting(true);
    try {
      await updateStationApi(editingId, draft);
      setEditingId(null);
      forceRefetch();
      toast.success("Station updated successfully.");
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message ?? "Failed to update station.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const doDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteStationApi(confirmDelete);
      setConfirmDelete(null);
      forceRefetch();
      toast.success("Station deleted successfully.");
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message ?? "Failed to delete station.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchBar value={q} onChange={setQ} placeholder="Search stations…" />
        <div className="ml-auto">
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Station
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Station ID</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Province</th>
              <th className="px-5 py-3 font-medium">District</th>
              <th className="px-5 py-3 font-medium">Town</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((s) => (
              <tr key={s.stationId}>
                <td className="px-5 py-3 font-mono text-xs">{s.stationId}</td>
                <td className="px-5 py-3 font-medium">{s.stationName}</td>
                <td className="px-5 py-3">
                  {provinces.find((p) => p._id === s.location.province)?.name ??
                    s.location.province}
                </td>
                <td className="px-5 py-3">
                  {provinces
                    .find((p) => p._id === s.location.province)
                    ?.districts.find((d) => d._id === s.location.district)?.name ??
                    s.location.district}
                </td>
                <td className="px-5 py-3">{s.location.town}</td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setConfirmDelete(s._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Building2} title="No stations found" />
          </div>
        ) : null}
      </div>

      <StationDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Station"
        draft={draft}
        setDraft={setDraft}
        isSubmitting={isSubmitting}
        onSubmit={submitAdd}
        submitLabel="Create station"
        provinces={provinces}
      />
      <StationDialog
        open={!!editingId}
        onOpenChange={(v) => {
          if (!v) setEditingId(null);
        }}
        title="Edit Station"
        draft={draft}
        setDraft={setDraft}
        isSubmitting={isSubmitting}
        onSubmit={submitEdit}
        submitLabel="Save changes"
        provinces={provinces}
      />
      <ConfirmModal
        open={!!confirmDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmDelete(null);
        }}
        title="Delete this station?"
        description="Staff and applications tied to this station will still exist but will no longer be scoped correctly. Reassign them first."
        confirmLabel="Delete"
        tone="destructive"
        isConfirming={isDeleting}
        onConfirm={doDelete}
      />
    </div>
  );
}

function StationDialog({
  open,
  onOpenChange,
  title,
  draft,
  setDraft,
  onSubmit,
  isSubmitting,
  submitLabel,
  provinces,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  draft: StationDraft;
  setDraft: (d: StationDraft) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  provinces: Province[];
}) {
  const set = (patch: Partial<StationDraft>) => setDraft({ ...draft, ...patch });
  const selectedProvince = useMemo(
    () => provinces.find((p) => p._id === draft.location.province),
    [provinces, draft.location.province],
  );
  const districts = selectedProvince?.districts ?? [];
  useEffect(() => {
    if (selectedProvince && !districts.find((d) => d._id === draft.location.district))
      set({ location: { ...draft.location, district: "" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {title.startsWith("Add")
              ? "Fill in the details for the new station."
              : "Update the station details."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Station name</Label>
            <Input
              value={draft.stationName}
              onChange={(e) => set({ stationName: e.target.value })}
              placeholder="e.g. Chinhoyi District Registry"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address</Label>
            <Input
              value={draft.location.address}
              onChange={(e) => set({ location: { ...draft.location, address: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Province</Label>
            <Select
              value={draft.location.province}
              onValueChange={(v) =>
                set({ location: { ...draft.location, province: v, district: "" } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>District</Label>
            <Select
              value={draft.location.district}
              onValueChange={(v) => set({ location: { ...draft.location, district: v } })}
              disabled={!draft.location.province || districts.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Town</Label>
            <Input
              value={draft.location.town}
              onChange={(e) => set({ location: { ...draft.location, town: e.target.value } })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Staff Tab ────────────────────────────────────────────────────────────

type StaffMemberDraft = Omit<StaffMember, "id" | "staffId">;

function StaffTab({
  staff,
  forceRefetch,
  stations,
}: {
  staff: StaffMember[];
  forceRefetch: () => void;
  stations: Station[];
}) {
  const [q, setQ] = useState("");
  const [stationFilter, setStationFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const emptyDraft = (): StaffMemberDraft => ({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    nationalIdNumber: "",
    role: "Registrar Officer",
    stationId: stations.length > 0 ? stations[0]._id : "",
    password: "",
    status: true,
  });
  const [draft, setDraft] = useState<StaffMemberDraft>(emptyDraft());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const filtered = staff.filter((s) => {
    if (stationFilter !== "all" && s.stationId !== stationFilter) return false;
    if (q.trim() === "") return true;
    const t = q.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(t) ||
      s.surname.toLowerCase().includes(t) ||
      s.staffId.toLowerCase().includes(t) ||
      s.email.toLowerCase().includes(t)
    );
  });

  const openAdd = () => {
    setDraft(emptyDraft());
    setAddOpen(true);
  };
  const openEdit = (s: StaffMember) => {
    setEditingId(s.id);
    setDraft({
      firstName: s.firstName,
      surname: s.surname,
      email: s.email,
      phone: s.phone,
      nationalIdNumber: s.nationalIdNumber,
      role: s.role,
      stationId: s.stationId,
      password: "", // Don't pre-fill password
      status: s.status,
    });
  };
  const validate = (d: StaffMemberDraft, mode: "add" | "edit") => {
    if (!d.firstName.trim() || !d.surname.trim()) return "Names are required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return "Enter a valid email.";
    if (!d.phone.trim() || !d.nationalIdNumber.trim()) return "Phone and National ID required.";
    if (d.role !== "Super Administrator" && !d.stationId) return "Please assign a station.";
    if (mode === "add" || d.password) {
      if (d.password.length < 4) return "Password must be at least 4 characters.";
    }
    return null;
  };
  const submitAdd = async () => {
    const err = validate(draft, "add");
    if (err) return toast.error(err);
    setIsSubmitting(true);
    try {
      await createStaffApi({
        ...draft, // staffId is no longer here
        stationId: draft.role === "Super Administrator" ? "ALL" : draft.stationId,
      });
      setAddOpen(false);
      toast.success("Staff added");
      forceRefetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const submitEdit = async () => {
    if (!editingId) return;
    const err = validate(draft, "edit");
    if (err) return toast.error(err);
    setIsSubmitting(true);
    try {
      const { status, ...payload } = draft;
      if (!payload.password) delete (payload as Partial<StaffMemberDraft>).password;
      await updateStaffApi(editingId, {
        ...payload,
        stationId: draft.role === "Super Administrator" ? "ALL" : draft.stationId,
      });
      setEditingId(null);
      toast.success("Staff updated");
      forceRefetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const doDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteStaffApi(confirmDelete);
      setConfirmDelete(null);
      setEditingId(null);
      toast.success("Staff deleted");
      forceRefetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete staff. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchBar value={q} onChange={setQ} placeholder="Search staff…" />
        <Select value={stationFilter} onValueChange={setStationFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stations</SelectItem>
            {stations.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.stationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Employee #</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Station</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3">
                  <div className="font-medium">
                    {s.firstName} {s.surname}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.email} · {s.phone}
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{s.staffId}</td>
                <td className="px-5 py-3">{s.role}</td>
                <td className="px-5 py-3 text-xs">
                  {stations.find((x) => x._id === s.stationId)?.stationName ?? s.stationId}
                </td>
                <td className="px-5 py-3 text-xs">
                  {s.status ? (
                    <span className="text-emerald-600">Active</span>
                  ) : (
                    <span className="text-muted-foreground">Suspended</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isToggling === s.id}
                    onClick={async () => {
                      setIsToggling(s.id);
                      try {
                        await toggleStaffActiveApi(s.id);
                        forceRefetch();
                      } catch (error) {
                        toast.error("Failed to update status.");
                      } finally {
                        setIsToggling(null);
                      }
                    }}
                  >
                    {isToggling === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : s.status ? (
                      "Suspend"
                    ) : (
                      "Activate"
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Users} title="No staff found" />
          </div>
        ) : null}
      </div>

      <StaffDialogSA
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Staff"
        draft={draft}
        setDraft={setDraft}
        isSubmitting={isSubmitting}
        onSubmit={submitAdd}
        submitLabel="Add"
        stations={stations}
        mode="add"
      />
      <StaffDialogSA
        open={!!editingId}
        onOpenChange={(v) => {
          if (!v) setEditingId(null);
        }}
        title="Edit Staff"
        draft={draft}
        setDraft={setDraft}
        isSubmitting={isSubmitting}
        onSubmit={submitEdit}
        submitLabel="Save"
        stations={stations}
        mode="edit"
        onDelete={() => setConfirmDelete(editingId)}
      />
      <ConfirmModal
        open={!!confirmDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmDelete(null);
        }}
        title="Delete this staff member?"
        description="This cannot be undone. The user loses access immediately."
        confirmLabel="Delete"
        tone="destructive"
        isConfirming={isDeleting}
        onConfirm={doDelete}
      />
    </div>
  );
}

function StaffDialogSA({
  open,
  onOpenChange,
  title,
  draft,
  setDraft,
  onSubmit,
  isSubmitting,
  submitLabel,
  stations,
  mode,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  draft: StaffMemberDraft;
  setDraft: (d: StaffMemberDraft) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  stations: Station[];
  mode: "add" | "edit";
  onDelete?: () => void;
}) {
  const set = (patch: Partial<StaffMemberDraft>) => setDraft({ ...draft, ...patch });
  const isSuper = draft.role === "Super Administrator";
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
            <Label>Phone</Label>
            <Input value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>National ID</Label>
            <Input
              value={draft.nationalIdNumber}
              onChange={(e) => set({ nationalIdNumber: e.target.value })}
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
            <Label>Employee #</Label>
            <Input
              value={mode === "edit" ? (draft as StaffMember).staffId : ""}
              disabled
              readOnly
            />
            <p className="text-[11px] text-muted-foreground">
              {mode === "add" ? "Auto-generated." : "Cannot change."}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={draft.role} onValueChange={(v) => set({ role: v as Role })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Administrator">Super Administrator</SelectItem>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Registrar Officer">Registrar Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Station</Label>
            <Select
              value={isSuper ? "ALL" : draft.stationId}
              onValueChange={(v) => set({ stationId: v })}
              disabled={isSuper}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign a station" />
              </SelectTrigger>
              <SelectContent>
                {isSuper ? <SelectItem value="ALL">All stations (system-wide)</SelectItem> : null}
                {stations.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.stationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Password</Label>
            <Input value={draft.password} onChange={(e) => set({ password: e.target.value })} />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <div>
            {onDelete ? (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{" "}
              {submitLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────

function ApplicationsTab({ stations }: { stations: Station[] }) {
  const { birth, nationalId, recovery } = useApps();
  const [q, setQ] = useState("");
  const [stationFilter, setStationFilter] = useState<string>("all");

  const rows = useMemo(() => {
    const rows = [
      ...birth.map((a) => ({
        id: `b-${a.id}`,
        appId: a.id,
        num: a.applicationNumber,
        name: a.applicantName,
        type: "Birth Certificate",
        stationId: a.stationId,
        status: a.status,
        date: a.dateSubmitted,
        path: "/applications/birth-certificates/$id",
      })),
      ...nationalId.map((a) => ({
        id: `n-${a.id}`,
        appId: a.id,
        num: a.applicationNumber,
        name: a.applicantName,
        type: "National ID",
        stationId: a.stationId,
        status: a.status,
        date: a.dateSubmitted,
        path: "/applications/national-id/$id",
      })),
      ...recovery.map((a) => ({
        id: `r-${a.id}`,
        appId: a.id,
        num: a.applicationNumber,
        name: a.applicantName,
        type: "Document Recovery",
        stationId: a.stationId,
        status: a.status,
        date: a.dateSubmitted,
        path: "/applications/document-recovery/$id",
      })),
    ];
    return rows
      .filter((r) => stationFilter === "all" || r.stationId === stationFilter)
      .filter(
        (r) =>
          q.trim() === "" ||
          r.name.toLowerCase().includes(q.toLowerCase()) ||
          r.num.toLowerCase().includes(q.toLowerCase()),
      )
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [birth, nationalId, recovery, q, stationFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search all applications…"
            />
          </div>
        </div>
        <Select value={stationFilter} onValueChange={setStationFilter}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stations</SelectItem>
            {stations.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.stationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Application #</th>
              <th className="px-5 py-3 font-medium">Applicant</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Station</th>
              <th className="px-5 py-3 font-medium">Submitted</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 font-mono text-xs">{r.num}</td>
                <td className="px-5 py-3 font-medium">{r.name}</td>
                <td className="px-5 py-3">{r.type}</td>
                <td className="px-5 py-3 text-xs">
                  {stations.find((s) => s._id === r.stationId)?.stationName ?? r.stationId}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {format(new Date(r.date), "dd MMM yyyy")}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to={r.path} params={{ id: r.appId }}>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1.5 h-4 w-4" /> View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={FileStack} title="No applications match filters" />
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        View-only access. Super Administrators cannot approve or reject applications.
      </p>
    </div>
  );
}
