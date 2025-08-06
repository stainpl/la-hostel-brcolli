import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { Gender } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const sessions = await prisma.student.findMany({
    distinct: ['sessionYear'],
    select: { sessionYear: true },
    orderBy: { sessionYear: 'desc' },
  })

  const currentSession = sessions[0]?.sessionYear
  if (!currentSession) return res.status(404).json({ message: 'No session data found' })

  const genders: Gender[] = [Gender.MALE, Gender.FEMALE]

  const data = await Promise.all(
    genders.map(async (gender) => {
      const total = await prisma.student.count({
        where: { gender, sessionYear: currentSession },
      })

      const paid = await prisma.student.count({
        where: { gender, sessionYear: currentSession, hasPaid: true },
      })

      return { gender, total, paid }
    })
  )

  return res.status(200).json(data)
}