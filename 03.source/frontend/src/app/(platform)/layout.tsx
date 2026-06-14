import { DashboardLayout } from "@/components/devias/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { RouteNavigationProvider, RouteResetMount } from "@/contexts/RouteNavigationContext";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteNavigationProvider>
      <DashboardLayout>
        <RouteGuard>
          <RouteResetMount>{children}</RouteResetMount>
        </RouteGuard>
      </DashboardLayout>
    </RouteNavigationProvider>
  );
}
