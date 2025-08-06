// src/pages/api/admin/admins/invite.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail } from '@/lib/mailer'
import { withLogging } from '@/lib/withLogging'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { nickname, email } = req.body
  if (!nickname || !email) return res.status(400).json({ message: 'Missing fields' })

  // 1) Create an invite token
  const token = crypto.randomBytes(24).toString('hex')
  await prisma.adminInvite.create({
    data: { email, nickname, token, expiresAt: new Date(Date.now()+86400000) }
  })

  // 2) Send email with link
  const link = `${process.env.NEXTAUTH_URL}/admin/accept-invite?token=${token}`
  await sendEmail({
    to: email,
    subject: 'Your Admin Invite',
    html: `<p>Hello ${nickname},</p>
           <p>Click <a href="${link}">here</a> to set your password.</p>
           <p>Link expires in 24 hours.</p>`
  })

  res.status(201).json({ message: 'Invite sent' })
}
export default withLogging(handler, 'admin.admins.invite')
