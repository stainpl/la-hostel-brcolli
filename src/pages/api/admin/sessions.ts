import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  try {
    const sessions = await prisma.student.findMany({
      select: { sessionYear: true },
      distinct: ['sessionYear'],
    })

    const years = sessions
      .map(s => s.sessionYear)
      .filter(Boolean)
      .sort()
      .reverse()

    return res.status(200).json({ sessions: years })
  } catch (error) {
    console.error('[GET /api/admin/sessions] Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}