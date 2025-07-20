// src/pages/api/students/tickets/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    return res.status(401).end()
  }
  const studentId = Number(session.user.id)
  const ticketId  = Number(req.query.id)

  if (req.method === 'GET') {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    })
    if (!ticket || ticket.studentId !== studentId) {
      return res.status(404).end()
    }
    return res.status(200).json(ticket)
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
