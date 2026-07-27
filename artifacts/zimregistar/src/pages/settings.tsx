import { useAuth } from "@/lib/store";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InfoRow } from "@/components/common/InfoRow";
import { DataCard } from "@/components/common/DataCard";
import { Button } from "@/components/ui/button";

export function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Super Administrator" || user?.role === "Administrator";

  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      <PageHeader title="System Settings" description="Manage your preferences and system configuration." />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="system">Preferences</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Administration</TabsTrigger>}
        </TabsList>
        
        <div className="mt-6 space-y-6">
          <TabsContent value="profile" className="m-0 border-0 space-y-6">
            <DataCard title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow label="Full Name" value={user?.name} />
                <InfoRow label="Employee Number" value={<span className="font-mono">{user?.employeeNumber}</span>} />
                <InfoRow label="Role" value={user?.role} />
                <InfoRow label="Station ID" value={user?.stationId} />
              </div>
            </DataCard>
            <div className="flex justify-end">
              <Button variant="outline">Change Password</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="system" className="m-0 border-0 space-y-6">
            <DataCard title="Display Preferences">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/60">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">Toggle between light and dark mode.</p>
                  </div>
                  <Button variant="outline" size="sm">System Default</Button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/60">
                  <div>
                    <p className="text-sm font-medium">Compact Table Rows</p>
                    <p className="text-xs text-muted-foreground">Reduce padding in data tables.</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </div>
            </DataCard>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="m-0 border-0 space-y-6">
              <DataCard title="System Administration">
                <p className="text-sm text-muted-foreground mb-4">Advanced configuration settings for administrators.</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">Manage API Keys</Button>
                  <Button variant="outline" className="w-full justify-start">Audit Logs</Button>
                  <Button variant="outline" className="w-full justify-start">Database Backup</Button>
                </div>
              </DataCard>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}