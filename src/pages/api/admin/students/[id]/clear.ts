// src/pages/api/admin/students/[id]/clear.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession }            from 'next-auth/next'
import { authOptions }                 from '@/pages/api/auth/[...nextauth]'
import { prisma }                      from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const id = Number(req.query.id)
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' })

  try {
    // Disconnect the room relation (sets roomId to null)
    await prisma.student.update({
      where: { id },
      data: { room: { disconnect: true } },
    })
    return res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('[/api/admin/students/[id]/clear]', err)
    return res.status(500).json({ message: 'Failed to clear room' })
  }
}
