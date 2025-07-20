// src/pages/api/admin/tickets/[id]/reply.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const ticketId = Number(req.query.id)
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { message } = req.body
  if (typeof message !== 'string' || message.trim().length < 1) {
    return res.status(400).json({ message: 'Reply cannot be empty.' })
  }

  try {
    // Ensure ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' })
    }

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        author: 'admin',
        message: message.trim(),
      },
    })

    // (Optional) trigger email notification to student here

    return res.status(201).json(reply)
  } catch (err: any) {
    console.error('Admin reply error:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}


