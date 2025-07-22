import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TestSyncComponentProps {
  className?: string
}

export function TestSyncComponent({ className }: TestSyncComponentProps) {
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