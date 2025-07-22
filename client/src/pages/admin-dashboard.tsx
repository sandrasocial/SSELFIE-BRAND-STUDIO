import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TestSyncComponentProps {
  className?: string
}

function TestSyncComponent({ className }: TestSyncComponentProps) {
  return (
    <Card className={cn("p-8 bg-[#0a0a0a] text-white", className)}>
      <h2 className="font-serif text-2xl mb-4">Sync Verification</h2>
      <p className="text-[#f5f5f5] font-light">
        This editorial test component confirms bidirectional file synchronization.
      </p>
      <div className="mt-6 p-4 bg-[#f5f5f5] text-[#0a0a0a] rounded-sm">
        <p className="font-serif italic">
          System Status: Connected
        </p>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl mb-8 text-[#0a0a0a]">Admin Dashboard</h1>
        <TestSyncComponent />
      </div>
    </div>
  )
}