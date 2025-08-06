// src/pages/api/admin/admins/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withLogging } from '@/lib/withLogging'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(admins)
}
export default withLogging(handler, 'admin.admins.list')