// src/pages/api/admin/rooms/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withLogging }                  from '@/lib/withLogging'

 async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = parseInt(req.query.id as string, 10)
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid room ID' })
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Fetch a single room
        const room = await prisma.room.findUnique({ where: { id } })
        if (!room) {
          return res.status(404).json({ message: 'Room not found' })
        }
        return res.status(200).json(room)
      }

      case 'PATCH': {
        // Update fields — e.g. mark as filled
        const { isFilled } = req.body
        const data: { isFilled?: boolean } = {}

        if (typeof isFilled === 'boolean') {
          data.isFilled = isFilled
        }

        if (Object.keys(data).length === 0) {
          return res.status(400).json({ message: 'No valid fields to update' })
        }

        const updatedRoom = await prisma.room.update({
          where: { id },
          data,
        })
        return res.status(200).json(updatedRoom)
      }

      case 'DELETE': {
        // Delete the room
        await prisma.room.delete({ where: { id } })
        return res.status(204).end()
      }

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error: unknown) {
   const message = error instanceof Error ? error.message : 'Unknown error';
   console.error('[/api/admin/rooms/[id]] error:', message, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withLogging(handler, 'admin.rooms.id')
