// src/app/dashboard/student/tickets/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TicketsClient from './TicketsClient'
import { TicketSummary } from './TicketsClient'


export default async function TicketsPage() {
  // 1) Protect route
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    redirect('/')
  }
  const studentId = Number(session.user.id)

  // 2) Fetch tickets, split by status
  const tickets = await prisma.ticket.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    select: {
      id:       true,
      subject:    true,
      status:   true,
      createdAt:true,
    },
  })

  const openTickets = tickets.filter((t: TicketSummary) => t.status === 'OPEN')
  const closedTickets = tickets.filter((t: TicketSummary) => t.status === 'CLOSED')

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <a
            href="/dashboard/student"
            className="text-indigo-600 hover:underline text-sm"
          >
            ← Back to Dashboard
          </a>
        </header>

        <TicketsClient
          openTickets={openTickets}
          closedTickets={closedTickets}
          studentId={studentId}
        />
      </main>
    </div>
  )
}
