// src/pages/api/students/[id]/room-request.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const studentId = Number(req.query.id)
  const { roomId } = req.body as { roomId?: number }

  if (!studentId || !roomId) {
    return res.status(400).json({ message: 'Missing student ID or roomId' })
  }

  try {
    // 1) Load room + occupants
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { students: true },
    })
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }
    if (room.isFilled || room.students.length >= 5) {
      return res.status(409).json({ message: 'Room already full' })
    }

    // 2) Assign the student
    await prisma.student.update({
      where: { id: studentId },
      data: { roomId },
    })

    // 3) If that was the 5th, mark filled
    if (room.students.length + 1 >= 5) {
      await prisma.room.update({
        where: { id: roomId },
        data: { isFilled: true },
      })
    }

    // 4) Return the price
    return res.status(200).json({ price: room.price })
  } catch (err) {
    console.error('[/api/students/:id/room-request] error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}
