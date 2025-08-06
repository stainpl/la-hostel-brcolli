// pages/api/auth/forgot-password.ts
import { NextApiRequest, NextApiResponse } from 'next'
import {prisma} from '@/lib/prisma'        
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body as { email: string }

  // Always return 200 to avoid leaking which emails exist
  try {
    const student = await prisma.student.findUnique({ where: { email } })
    if (student) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1h

      await prisma.studentReset.create({
        data: {
          studentId: student.id,
          token,
          expiresAt,
        },
      })

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

      await transporter.sendMail({
        from: `"Your School" <${process.env.SMTP_USER}>`,
        to: student.email,
        subject: '🔒 Password reset request',
        html: `
          <p>Hi ${student.fullName},</p>
          <p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>
        `,
      })
    }
    // Always return success
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Unexpected error' })
  }
}