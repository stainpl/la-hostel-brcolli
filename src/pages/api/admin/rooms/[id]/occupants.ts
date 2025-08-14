import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withLogging } from '@/lib/withLogging'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const roomId = Number(req.query.id)
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const occupants = await prisma.student.findMany({
      where: { roomId },
      select: {
        id: true,
        fullName: true,
        dept: true,
        lastPaymentDate: true,
      },
    })
    return res.status(200).json(occupants)
  } catch (error) {
    console.error(`[/api/admin/rooms/${roomId}/occupants]`, error)
    return res.status(500).json({ message: 'Failed to load occupants' })
  }
}

export default withLogging(handler, 'admin.rooms.occupants')
