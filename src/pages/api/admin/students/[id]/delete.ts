// src/pages/api/admin/students/[id]/delete.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession }            from 'next-auth/next'
import { authOptions }                 from '@/pages/api/auth/[...nextauth]'
import { prisma }                      from '@/lib/prisma'
import { withLogging }                 from '@/lib/withLogging'

async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    // Delete the student record (cascades tickets/payments if you set up those relations)
    await prisma.student.delete({ where: { id } })
    return res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('[/api/admin/students/[id]/delete]', err)
    return res.status(500).json({ message: 'Failed to delete student' })
  }
}

export default withLogging(handler, 'admin.students.delete')