// src/pages/api/students/tickets/[id]/reply.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { withLogging } from '@/lib/withLogging'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    return res.status(401).end()
  }
  const studentId = Number(session.user.id)
  const ticketId  = Number(req.query.id)

  if (req.method === 'POST') {
    const { message } = req.body
    if (typeof message !== 'string' || message.trim().length < 1) {
      return res.status(400).json({ message: 'Reply cannot be empty.' })
    }

    // Ensure ticket belongs to student and is open
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { studentId: true, status: true },
    })
    if (!ticket || ticket.studentId !== studentId) {
      return res.status(404).end()
    }
    if (ticket.status !== 'OPEN') {
      return res.status(400).json({ message: 'Ticket is closed.' })
    }

    // Create the reply
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        author: 'student',
        message: message.trim(),
      },
    })

    return res.status(201).json(reply)
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
export default withLogging(handler, 'students.ticket.reply')
