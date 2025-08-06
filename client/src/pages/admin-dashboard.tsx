import { useAuth } from "@/hooks/use-auth"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { AdminStats } from "@/components/admin/AdminStats"
import { UserManagement } from "@/components/admin/UserManagement"
import { ContestManagement } from "@/components/admin/ContestManagement"
import { SystemHealth } from "@/components/admin/SystemHealth"
import { TestButton } from "@/components/admin/TestButton"

export default function AdminDashboardPage() {
  const { user } = useAuth()

  // Check if user is Sandra (admin access required)
  if (!user || user.email !== "sandra@sselfie.com") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This page is restricted to admin users only.</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminStats />
        
        {/* Admin Test Suite */}
        <TestButton />
        
        <div className="grid gap-6 md:grid-cols-2">
          <UserManagement />
          <ContestManagement />
        </div>
        <SystemHealth />
      </div>
    </AdminLayout>
  )
}