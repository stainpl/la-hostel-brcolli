// pages/api/auth/validate-reset.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import {prisma} from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query as { token?: string }
  if (!token) return res.status(400).json({ valid: false, error: 'No token provided' })

  const reset = await prisma.studentReset.findUnique({ where: { token } })
  const valid = !!reset && reset.expiresAt > new Date()

  return res.status(200).json({ valid })
}
