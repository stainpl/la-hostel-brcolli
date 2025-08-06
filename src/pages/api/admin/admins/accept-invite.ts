// src/pages/api/admin/admins/accept-invite.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.method === 'GET' ? req.query : req.body
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Token is required.' })
  }

  // Common lookup
  const invite = await prisma.adminInvite.findUnique({ where: { token } })

  //  GET: just validate
  if (req.method === 'GET') {
    if (!invite || invite.expiresAt < new Date()) {
      return res.status(404).json({ message: 'Invalid or expired token.' })
    }
    return res.status(200).end()   // OK, token is valid
  }

  // POST: consume it
  if (req.method === 'POST') {
    const { password } = req.body as { password?: string }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' })
    }
    if (!invite || invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token.' })
    }

    // 1) Create the admin
    const hash = await bcrypt.hash(password, 10)
    await prisma.admin.create({
      data: {
        email:        invite.email,
        passwordHash: hash,
      },
    })

    // 2) Delete the invite so the token can’t be reused
    await prisma.adminInvite.delete({ where: { id: invite.id } })

    return res.status(200).json({ message: 'Password set! You may now log in.' })
  }

  // Others: method not allowed
  res.setHeader('Allow', ['GET','POST'])
  return res 
        .status(405)
        .json({ message: `Method ${req.method} Not Allowed` })
}