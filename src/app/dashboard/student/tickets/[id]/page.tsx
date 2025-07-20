// src/app/dashboard/student/tickets/[id]/page.tsx
import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReplyForm from '@/components/forms/TicketReplyForm'

interface TicketReply {
  id: number
  author: string
  message: string
  createdAt: Date
}

interface TicketThread {
  id: number
  subject: string
  message: string
  imageUrl?: string | null
  status: 'OPEN' | 'CLOSED'
  replies: TicketReply[]
  studentId: number
}

type Props = { params: { id: string } }

export default async function TicketThreadPage({ params }: { params: any }) {
  // Protect route
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    redirect('/')
  }
  const studentId = Number(session.user.id)
  const ticketId  = Number(params.id)

  // Fetch ticket and replies
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { replies: { orderBy: { createdAt: 'asc' } } },
  }) as TicketThread | null

  // Redirect if not found or not owned by this student
  if (!ticket || ticket.studentId !== studentId) {
    redirect('/dashboard/student/tickets')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard/student/tickets"
          className="text-indigo-600 hover:underline text-sm"
        >
          ← Back to Tickets
        </Link>

        {/* Ticket Details */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-semibold">{ticket.subject}</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{ticket.message}</p>
          {ticket.imageUrl && (
            <img
              src={ticket.imageUrl}
              alt="Ticket attachment"
              className="max-w-full rounded"
            />
          )}
        </div>

        {/* Thread Replies */}
        <div className="flex flex-col space-y-4">
  {ticket.replies.map((r) => (
    <div
      key={r.id}
      className={`flex ${
        r.author === 'admin' ? 'justify-start' : 'justify-end' }`}
    >
      <div
        // Bubble styling
        className={`
          max-w-[70%]           
          px-4 py-2            
          rounded-lg            
          ${r.author === 'admin'
            ? 'bg-green-100 rounded-tl-none'  
            : 'bg-blue-200 rounded-tr-none' } `}
      >
        <p className="text-gray-800 whitespace-pre-wrap">{r.message}</p>
        <p className="text-xs text-gray-500 mt-1 text-right">
          {new Date(r.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  ))}
    </div>

        {/* Reply Form or Closed Notice */}
        {ticket.status === 'OPEN' ? (
          <ReplyForm ticketId={ticketId} />
        ) : (
          <div className="text-center text-gray-500 font-semibold">
            This ticket is closed.
          </div>
        )}
      </main>
    </div>
  )
}
