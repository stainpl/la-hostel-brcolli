// src/pages/api/admin/rooms/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const roomId = Number(id)

  if (Number.isNaN(roomId)) {
    return res.status(400).json({ message: 'Invalid room ID' })
  }

  try {
    if (req.method === 'GET') {
      // Fetch a single room
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      })
      if (!room) {
        return res.status(404).json({ message: 'Room not found' })
      }
      return res.status(200).json(room)
    }

    if (req.method === 'PATCH') {
      // Update fields on the room. Here we only support isFilled, but you can expand.
      const { isFilled }: { isFilled?: boolean } = req.body

      const data: any = {}
      if (typeof isFilled === 'boolean') {
        data.isFilled = isFilled
      }

      if (Object.keys(data).length === 0) {
        return res
          .status(400)
          .json({ message: 'No valid fields to update' })
      }

      const updated = await prisma.room.update({
        where: { id: roomId },
        data,
      })
      return res.status(200).json(updated)
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'PATCH'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error: any) {
    console.error('[/api/admin/rooms/[id]] error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
