// src/pages/api/admin/students/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'

// 1) Disable built‑in body parsing so formidable can handle it
export const config = {
  api: {
    bodyParser: false,
  },
}

// 2) Helper to parse with formidable
function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only PATCH
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Auth check
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const id = Number(req.query.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid student ID' })
  }

  try {
    // 3) Parse incoming form fields + file
    const { fields, files } = await parseForm(req)

    const rawHasPaid = fields.hasPaid


    const fullName     = String(fields.fullName)
    const regNo        = String(fields.regNo)
    const phone        = String(fields.phone)
    const email        = String(fields.email)
    const state        = String(fields.state)
    const lga          = String(fields.lga)
    const gender       = String(fields.gender) as 'MALE' | 'FEMALE'
    const sponsorName  = String(fields.sponsorName)
    const sponsorPhone = String(fields.sponsorPhone)
    const sessionYear  = Number(fields.sessionYear)
    const roomId       = fields.roomId ? Number(fields.roomId) : null
    const hasPaid = rawHasPaid === 'true' || rawHasPaid === 'on'

    // 4) Handle profilePhoto if uploaded
    let profilePhoto: string | undefined
    if (files.profilePhoto) {
      const file = Array.isArray(files.profilePhoto)
        ? files.profilePhoto[0]
        : files.profilePhoto
      // formidable v3 uses file.newFilename
      const filename = (file as any).newFilename || path.basename(file.filepath)
      profilePhoto = `/uploads/${filename}`
    }

    // 5) Perform update
    await prisma.student.update({
      where: { id },
      data: {
        fullName,
        regNo,
        phone,
        email,
        state,
        lga,
        gender,
        sponsorName,
        sponsorPhone,
        sessionYear,
        roomId,
        hasPaid,
        ...(profilePhoto ? { profilePhoto } : {}),
      },
    })

    return res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('[/api/admin/students/[id]] update error:', err)
    return res.status(500).json({ message: err.message || 'Internal Server Error' })
  }
}
