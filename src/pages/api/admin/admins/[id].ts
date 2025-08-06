// src/pages/api/admin/admins/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withLogging } from '@/lib/withLogging'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (req.method === 'DELETE') {
    await prisma.admin.delete({ where: { id } })
    return res.status(200).json({ message: 'Admin deleted' })
  }
  res.setHeader('Allow',['DELETE'])
  res.status(405).end()
}
export default withLogging(handler, 'admin.admins.delete')