// pages/api/students/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import formidable, { File } from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'

// Disable Next.js’s default JSON body parser
export const config = {
  api: { bodyParser: false },
}

// Helper to parse the multipart form
function parseForm(req: NextApiRequest): Promise<{
  fields: formidable.Fields
  files: formidable.Files
}> {
  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public', 'uploads'),
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // 1) Parse the form
    const { fields, files } = await parseForm(req)

    // 2) Manually narrow each field to a string
    const fullName = Array.isArray(fields.fullName)
      ? fields.fullName[0]
      : fields.fullName ?? ''
    const regNo = Array.isArray(fields.regNo)
      ? fields.regNo[0]
      : fields.regNo ?? ''
    const email = Array.isArray(fields.email)
      ? fields.email[0]
      : fields.email ?? ''
    const phone = Array.isArray(fields.phone)
      ? fields.phone[0]
      : fields.phone ?? ''
    const state = Array.isArray(fields.state)
      ? fields.state[0]
      : fields.state ?? ''
    const lga = Array.isArray(fields.lga)
      ? fields.lga[0]
      : fields.lga ?? ''
    const gender = Array.isArray(fields.gender)
      ? fields.gender[0]
      : fields.gender ?? ''
    const sponsorName = Array.isArray(fields.sponsorName)
      ? fields.sponsorName[0]
      : fields.sponsorName ?? ''
    const sponsorPhone = Array.isArray(fields.sponsorPhone)
      ? fields.sponsorPhone[0]
      : fields.sponsorPhone ?? ''
    const sessionYear = Array.isArray(fields.sessionYear)
      ? fields.sessionYear[0]
      : fields.sessionYear ?? ''
    const password = Array.isArray(fields.password)
      ? fields.password[0]
      : fields.password ?? ''
    const confirmPassword = Array.isArray(fields.confirmPassword)
      ? fields.confirmPassword[0]
      : fields.confirmPassword ?? ''

    // 3) Basic validation
    if (
      !fullName ||
      !regNo ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: 'Passwords do not match' })
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' })
    }

    // 4) Check for existing student by regNo or email
    const exists = await prisma.student.findFirst({
      where: { OR: [{ email }, { regNo }] },
    })
    if (exists) {
      return res
        .status(409)
        .json({ message: 'Email or RegNo already registered' })
    }

    // 5) Handle profile photo upload
    let photoUrl: string | null = null
    const fileField = files.profilePhoto as File | File[] | undefined
    if (fileField) {
      const file = Array.isArray(fileField)
        ? fileField[0]
        : fileField
      const data = await fs.readFile(file.filepath)
      const fileName = `${Date.now()}_${file.originalFilename}`
      const dest = path.join(
        process.cwd(),
        'public',
        'uploads',
        fileName
      )
      await fs.writeFile(dest, data)
      photoUrl = `/uploads/${fileName}`
    }

    // 6) Hash password and save the student
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.student.create({
      data: {
        fullName,
        regNo,
        phone,
        email,
        state,
        lga,
        gender: gender as any,
        sponsorName,
        sponsorPhone,
        sessionYear: Number(sessionYear),
        passwordHash,
        profilePhoto: photoUrl,
      },
    })

    // 7) Success response
    return res.status(201).json({ message: 'Registered' })
  } catch (error: any) {
    console.error('Registration error:', error)
    if (
      error instanceof Error &&
      error.message.includes('maxFileSize')
    ) {
      return res
        .status(413)
        .json({ message: 'Uploaded file too large' })
    }
    return res.status(500).json({ message: 'Server error' })
  }
}
