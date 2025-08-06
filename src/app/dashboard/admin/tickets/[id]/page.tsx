// src/app/dashboard/admin/tickets/[id]/page.tsx
import React from 'react'
import Link from 'next/link'
import axios from 'axios'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminReplyForm from '@/components/forms/AdminReplyForm'
import CloseTicketButton from '@/components/ui/CloseTicketButton'



type Reply = {
  id:        number
  author:    string
  message:   string
  createdAt: Date
}

type TicketWithReplies = {
  id:        number
  studentId: number
  subject:   string
  message:   string
  imageUrl?: string | null
  status:    'OPEN' | 'CLOSED'
  createdAt: Date
  student:   { fullName: string; email: string }
  replies:   Reply[]
}

export default async function AdminTicketPage({
  params,
}: {
  params: { id: string }
}) {
  // 1) Admin guard
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  const p = await params as Record<string, string>
  const ticketId = Number(p.id)

  // 2) Fetch ticket + replies + student info
  const ticket = (await prisma.ticket.findUnique({
  where: { id: ticketId },
  include: {
    student: { select: { fullName: true, email: true } },
    replies: { orderBy: { createdAt: 'asc' } },
  },
})) as TicketWithReplies | null

  if (!ticket) {
    redirect('/dashboard/admin/tickets')
  }

  const handleClose = async () => {
    if (!confirm('Close this ticket?')) return
    await axios.patch(`/api/admin/tickets/${ticketId}/close`)
    // Refresh the page to update status
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <Link
            href="/dashboard/admin/tickets"
            className="text-indigo-600 hover:underline text-sm"
          >
            ← Back to Tickets
          </Link>
          {ticket.status === 'OPEN' && (<CloseTicketButton ticketId={ticketId} />)}
        </header>

        {/* Ticket Header */}
        <div className="bg-white p-6 rounded-lg shadow space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">{ticket.subject}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
          {ticket.imageUrl && (
            <img
              src={ticket.imageUrl}
              alt="Attachment"
              className="max-w-full rounded"
            />
          )}
          <div className="text-sm text-gray-500">
            Opened by{' '}
            <span className="font-medium">{ticket.student.fullName}</span>{' '}
            ({ticket.student.email}) on{' '}
            {new Date(ticket.createdAt).toLocaleString()}
          </div>
        </div>

              {/* Replies Thread */}
        <div className="flex flex-col space-y-4">
            {ticket.replies.map((r) => (
           <div key={r.id} className={`flex ${
        r.author === 'admin' ? 'justify-start' : 'justify-end'}`}
    >
            <div
        // Bubble styling
        className={`
          max-w-[70%]            
          px-4 py-2             
          rounded-lg            
          ${r.author === 'admin'
            ? 'bg-green-100 rounded-tl-none' 
            : 'bg-blue-200 rounded-tr-none'   }`}
      >
        <p className="text-gray-800 whitespace-pre-wrap">{r.message}</p>
        <p className="text-xs text-gray-500 mt-1 text-right">
          {new Date(r.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
   ))}
      </div>

        {/* Admin Reply Form */}
        {ticket.status === 'OPEN' ? (
          <AdminReplyForm ticketId={ticketId} />
        ) : (
          <p className="text-center text-gray-500 font-semibold">
            This ticket is closed.
          </p>
        )}
      </main>
    </div>
  )
}
