// pages/api/auth/reset-password.ts
import { NextApiRequest, NextApiResponse } from 'next'
import {prisma} from '@/lib/prisma'
import bcrypt from 'bcrypt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token, newPassword } = req.body as { token: string; newPassword: string }

  const reset = await prisma.studentReset.findUnique({
    where: { token },
    include: { student: true },
  })
  if (!reset || reset.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' })
  }

  const hash = await bcrypt.hash(newPassword, 10)
  await prisma.student.update({
    where: { id: reset.studentId },
    data: { passwordHash: hash },
  })
  // optional: delete all resets for this student
  await prisma.studentReset.deleteMany({ where: { studentId: reset.studentId } })

  return res.status(200).json({ ok: true })
}