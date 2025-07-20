// src/pages/api/admin/rooms/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const rooms = await prisma.room.findMany({
        orderBy: [{ block: 'asc' }, { number: 'asc' }],
      })
      return res.status(200).json(rooms)
    }

    if (req.method === 'POST') {
      const { block, number, price, gender } = req.body as {
        block:  string
        number: number
        price:  number
        gender: string
      }

      console.log('Creating room with', { block, number, price, gender })

      // Duplicate check
      const exists = await prisma.room.findFirst({
        where: { block, number },
      })
      if (exists) {
        return res
          .status(409)
          .json({ message: `Room ${block}${number} already exists` })
      }

      // Create with gender
      const newRoom = await prisma.room.create({
        data: { block, number, price, gender, isFilled: false },
      })
      return res.status(201).json(newRoom)
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (err) {
    console.error('[/api/admin/rooms] error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}