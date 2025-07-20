// src/pages/api/students/tickets/[id]/close.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    return res.status(401).end()
  }
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const studentId = Number(session.user.id)
  const ticketId  = Number(req.query.id)

  // Ensure the ticket belongs to this student and is still open
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { studentId: true, status: true },
  })
  if (!ticket || ticket.studentId !== studentId) {
    return res.status(404).end()
  }
  if (ticket.status !== 'OPEN') {
    return res.status(400).json({ message: 'Ticket is already closed.' })
  }

  // Close it
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'CLOSED' },
  })

  // (Optionally) send an email notification here

  return res.status(200).json({ success: true })
}
