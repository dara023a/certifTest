import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { ToastProvider } from "@/components/admin/toast";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGuard>
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </AdminGuard>
  );
}
