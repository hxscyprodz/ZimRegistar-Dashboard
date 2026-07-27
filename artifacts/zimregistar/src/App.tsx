import { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { Toaster } from "sonner";
import { useAuth, useUI } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";

import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { BirthCertListPage } from "@/pages/birth-certificates";
import { BirthCertDetailPage } from "@/pages/birth-certificate-detail";
import { NationalIdListPage } from "@/pages/national-id";
import { NationalIdDetailPage } from "@/pages/national-id-detail";
import { RecoveryListPage } from "@/pages/document-recovery";
import { RecoveryDetailPage } from "@/pages/document-recovery-detail";
import { ApprovedPage } from "@/pages/approved-applications";
import { PrintingCenterPage } from "@/pages/printing-center";
import { ReportsPage } from "@/pages/reports";
import { SettingsPage } from "@/pages/settings";
import { SuperAdminPage } from "@/pages/super-admin";
import { NotificationsPage } from "@/pages/notifications";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const [, navigate] = useLocation();
  useEffect(() => { if (!user) navigate("/auth/login"); }, [user, navigate]);
  if (!user) return null;
  return <AppShell>{children}</AppShell>;
}

function App() {
  const dark = useUI((s) => s.dark);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  return (
    <>
      <Switch>
        <Route path="/" component={() => <Redirect to="/auth/login" />} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/dashboard" component={() => <ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/applications/birth-certificates/:id" component={() => <ProtectedRoute><BirthCertDetailPage /></ProtectedRoute>} />
        <Route path="/applications/birth-certificates" component={() => <ProtectedRoute><BirthCertListPage /></ProtectedRoute>} />
        <Route path="/applications/national-id/:id" component={() => <ProtectedRoute><NationalIdDetailPage /></ProtectedRoute>} />
        <Route path="/applications/national-id" component={() => <ProtectedRoute><NationalIdListPage /></ProtectedRoute>} />
        <Route path="/applications/document-recovery/:id" component={() => <ProtectedRoute><RecoveryDetailPage /></ProtectedRoute>} />
        <Route path="/applications/document-recovery" component={() => <ProtectedRoute><RecoveryListPage /></ProtectedRoute>} />
        <Route path="/approved-applications" component={() => <ProtectedRoute><ApprovedPage /></ProtectedRoute>} />
        <Route path="/printing-center" component={() => <ProtectedRoute><PrintingCenterPage /></ProtectedRoute>} />
        <Route path="/reports" component={() => <ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings" component={() => <ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/super-admin" component={() => <ProtectedRoute><SuperAdminPage /></ProtectedRoute>} />
        <Route path="/notifications" component={() => <ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route component={NotFound} />
      </Switch>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;