// src/pages/api/admin/logs.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const logs = await prisma.log.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
  })
  res.status(200).json(logs)
}
