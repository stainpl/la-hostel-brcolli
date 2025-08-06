// src/pages/api/admin/rooms/[id]/empty.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withLogging }                  from '@/lib/withLogging'


 async function handler(req: NextApiRequest, res: NextApiResponse) {
  const roomId = Number(req.query.id)
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end()
  }
  // unassign all students & unfill
  await prisma.student.updateMany({
    where: { roomId },
    data: { roomId: null },
  })
  const room = await prisma.room.update({
    where: { id: roomId },
    data: { isFilled: false },
  })
  return res.status(200).json(room)
}

export default withLogging(handler, 'admin.rooms.empty')