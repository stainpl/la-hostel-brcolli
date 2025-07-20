// src/app/dashboard/loading.tsx
import Spinner from '@/components/ui/Spinner'

export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50">
      <Spinner size={12} colorClass="text-gray-700" />
    </div>
  )
}
