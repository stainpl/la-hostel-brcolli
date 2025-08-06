// src/pages/api/admin/admins/[id]/reset.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail } from '@/lib/mailer'
import { withLogging } from '@/lib/withLogging'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const id = Number(req.query.id)
  const admin = await prisma.admin.findUnique({ where: { id } })
  if (!admin) return res.status(404).end()

  // generate reset token
  const token = crypto.randomBytes(24).toString('hex')
  await prisma.passwordReset.create({ data: {
    adminId: id, token, expiresAt: new Date(Date.now()+3600000)
  }})

  const link = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${token}`
  await sendEmail({
    to: admin.email!,
    subject: 'Reset your admin password',
    html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`
  })

  res.status(200).json({ message: 'Reset link sent' })
}
export default withLogging(handler, 'admin.admins.reset')
