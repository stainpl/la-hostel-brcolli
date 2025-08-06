// pages/api/admin/admins/reset-password.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = (req.method === 'GET' ? req.query.token : req.body.token) as string|null

  if (!token) {
    return res.status(400).json({ message: 'Token is required.' })
  }

  // Lookup the reset record
  const pr = await prisma.passwordReset.findUnique({ where: { token } })
  if (!pr || pr.expiresAt < new Date()) {
    return res.status(404).json({ message: 'Invalid or expired token.' })
  }

  if (req.method === 'GET') {
    // Token is valid
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    const { password } = req.body as { password?: string }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' })
    }
    // 1) Update the admin’s password
    const hash = await bcrypt.hash(password, 10)
    await prisma.admin.update({
      where: { id: pr.adminId },
      data: { passwordHash: hash },
    })
    // 2) Delete the token so it cannot be reused
    await prisma.passwordReset.delete({ where: { id: pr.id } })
    return res.status(200).json({ message: 'Password has been reset.' })
  }

  res.setHeader('Allow', ['GET','POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}