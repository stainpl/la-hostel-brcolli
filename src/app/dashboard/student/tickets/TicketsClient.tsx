// src/app/dashboard/student/tickets/TicketsClient.tsx
'use client'

import { useState } from 'react'
import TicketForm from '@/components/forms/TicketForm'
import TicketList from '@/components/ui/TicketList'

export type TicketSummary = {
  id:        number
  subject:     string
  status:    'OPEN' | 'CLOSED'
  createdAt: Date
}

interface Props {
  openTickets:   TicketSummary[]
  closedTickets: TicketSummary[]
  studentId:     number
}

export default function TicketsClient({ openTickets, closedTickets, studentId }: Props) {
  const [tab, setTab] = useState<'open' | 'closed' | 'new'>(
    openTickets.length > 0 ? 'open' : 'new'
  )

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <nav className="flex space-x-4 border-b">
        <button
          onClick={() => setTab('open')}
          className={`pb-2 ${tab==='open' ? 'border-b-2 border-indigo-600 font-semibold' : 'text-gray-600'}`}
        >
          Open Tickets ({openTickets.length})
        </button>
        <button
          onClick={() => setTab('closed')}
          className={`pb-2 ${tab==='closed' ? 'border-b-2 border-indigo-600 font-semibold' : 'text-gray-600'}`}
        >
          Closed Tickets ({closedTickets.length})
        </button>
        {/* Only allow new if no open exist */}
        <button
          onClick={() => setTab('new')}
          className={`pb-2 ${tab==='new' ? 'border-b-2 border-indigo-600 font-semibold' : 'text-gray-600'}`}
          disabled={openTickets.length > 0}
        >
          New Ticket
        </button>
      </nav>

      {/* Panels */}
      {tab === 'open' && (
        openTickets.length > 0
          ? <TicketList tickets={openTickets} />
          : <p className="text-gray-600">You have no open tickets.</p>
      )}

      {tab === 'closed' && (
        closedTickets.length > 0
          ? <TicketList tickets={closedTickets} />
          : <p className="text-gray-600">You have no closed tickets.</p>
      )}

      {tab === 'new' && (
        <TicketForm studentId={studentId} />
      )}
    </div>
  )
}
