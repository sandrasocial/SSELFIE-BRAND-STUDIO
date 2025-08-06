import { useAuth } from "@/hooks/use-auth"
import AdminLayout from "@/components/AdminLayout"
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
    <AdminLayout title="ADMIN DASHBOARD" subtitle="SSELFIE Studio Administration & Agent Intelligence Center">
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-light tracking-wider mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            {'A D M I N   D A S H B O A R D'.split('').join(' ')}
          </h1>
          <p className="text-gray-600 text-sm tracking-wide">
            SSELFIE Studio Administration & Agent Intelligence Center
          </p>
        </div>
        
        {/* Admin Test Suite */}
        <TestButton />
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            System Status
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Database Status</div>
              <div className="text-lg font-medium text-green-600">Operational</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Agent Intelligence</div>
              <div className="text-lg font-medium text-yellow-600">Restoring</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Active Agents</div>
              <div className="text-lg font-medium text-blue-600">14 Agents</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}