import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Ban, Moon, Bell, Shield } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUI, useAuth } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings" }] }),
  component: Settings,
});

const sampleStaff = [
  { id: "1", name: "Tafadzwa Moyo", emp: "RG-04821", role: "Registrar Officer", active: true },
  { id: "2", name: "Nyasha Dube", emp: "RG-03317", role: "Supervisor", active: true },
  { id: "3", name: "Rumbidzai Sibanda", emp: "RG-01902", role: "Administrator", active: true },
  { id: "4", name: "Tinashe Mhandu", emp: "RG-05512", role: "Registrar Officer", active: false },
];

function Settings() {
  const { dark, toggleDark } = useUI();
  const user = useAuth((s) => s.user);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

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
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="font-display font-bold">Staff Members</h3>
              <Button size="sm" onClick={() => toast.info("Add staff form coming soon")}><Plus className="mr-2 h-4 w-4" /> Add Staff</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Employee #</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sampleStaff.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-medium">{s.name}</td>
                    <td className="px-5 py-3 font-mono text-xs">{s.emp}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gov/10 px-2 py-0.5 text-xs font-medium text-gov dark:bg-primary/15 dark:text-primary">
                        <Shield className="h-3 w-3" /> {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs">{s.active ? <span className="text-emerald-600">Active</span> : <span className="text-muted-foreground">Suspended</span>}</td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => toast.info("Edit")}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast.warning(s.active ? "Suspended" : "Reactivated")}>
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
    </div>
  );
}