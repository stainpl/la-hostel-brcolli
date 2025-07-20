// src/pages/api/admin/tickets/[id]/close.ts
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
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' })
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ message: 'Ticket already closed.' })
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' },
    })

    // (Optional) email student that ticket closed

    return res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('Admin close ticket error:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
