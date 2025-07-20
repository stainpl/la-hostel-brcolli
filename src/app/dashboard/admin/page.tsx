// app/dashboard/admin/page.tsx
import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export default function AdminDashboard() {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Link href="/dashboard/admin/rooms">
        <Card>
          <h2 className="text-xl font-semibold mb-2">Rooms</h2>
          <p>Manage blocks and rooms</p>
        </Card>
      </Link>

      <Link href="/dashboard/admin/students">
        <Card>
          <h2 className="text-xl font-semibold mb-2">Students</h2>
          <p>View and edit student data</p>
        </Card>
      </Link>

      <Link href="/dashboard/admin/tickets">
        <Card>
          <h2 className="text-xl font-semibold mb-2">Tickets</h2>
          <p>View and reply to tickets</p>
        </Card>
      </Link>

      <Link href="/dashboard/admin/logs">
        <Card>
          <h2 className="text-xl font-semibold mb-2">Logs</h2>
          <p>View system logs</p>
        </Card>
      </Link>
    </div>
  )
}
