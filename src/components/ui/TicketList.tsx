// src/components/ui/TicketList.tsx
'use client'

import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { TicketSummary } from '@/app/dashboard/student/tickets/TicketsClient'

export default function TicketList({ tickets }: { tickets: TicketSummary[] }) {
  const router = useRouter()

  const handleClose = async (id: number) => {
    if (!confirm('Are you sure you want to close this ticket?')) return
    await axios.patch(`/api/students/tickets/${id}/close`)
    router.refresh()
  }

  return (
    <ul className="space-y-4">
      {tickets.map((t) => (
        <li
          key={t.id}
          className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
        >
          <div>
            <h4 className="font-semibold">{t.subject}</h4>
            <p className="text-sm text-gray-500">
              {new Date(t.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex space-x-2">
            <Link
              href={`/dashboard/student/tickets/${t.id}`}
              className="text-indigo-600 hover:underline"
            >
              {t.status === 'OPEN' ? 'View & Reply' : 'View'}
            </Link>

            {t.status === 'OPEN' && (
              <button
                onClick={() => handleClose(t.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Close
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
