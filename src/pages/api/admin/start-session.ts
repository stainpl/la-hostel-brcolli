import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession }      from 'next-auth/next'
import { authOptions }           from '@/pages/api/auth/[...nextauth]'
import { prisma }                from '@/lib/prisma'
import { withLogging }           from '@/lib/withLogging'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { newSession } = req.body as { newSession?: string }
    if (!newSession?.trim()) {
      return res.status(400).json({ message: 'newSession is required' })
    }

    // 1) Update currentSession
    await prisma.config.upsert({
      where: { key: 'currentSession' },
      update: { value: newSession.trim() },
      create: { key: 'currentSession', value: newSession.trim() },
    })

    // 2) Clear all room assignments & hasPaid flags
    await prisma.$transaction([
      prisma.student.updateMany({ data: { roomId: null, hasPaid: false } }),
      // optionally: archive or keep past payments—do NOT delete payment records,
      // since they carry their own sessionYear
    ])

    return res.status(200).json({ message: `Session set to "${newSession.trim()}" and all assignments cleared.` })
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

export default withLogging(handler, 'admin.startSession')