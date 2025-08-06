// pages/api/admin/students.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type StudentDTO = {
  id: number
  fullName: string
  regNo: string
  gender: 'MALE' | 'FEMALE'
  sessionYear: string
  email: string
  phone: string
  paymentStatus: 'PAID' | 'PENDING'
  ticketStatus: 'OPEN' | 'CLOSED'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        fullName: true,
        regNo: true,
        gender: true,
        sessionYear: true,
        email: true,
        phone: true,
        payments: {
          select: {
            status: true,
          },
          take: 1, 
        },
        tickets: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    })

    const result: StudentDTO[] = students.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      regNo: s.regNo,
      gender: s.gender,
      sessionYear: s.sessionYear,
      email: s.email,
      phone: s.phone,
      paymentStatus: (s.payments[0]?.status ?? 'PENDING') as 'PAID' | 'PENDING',
      ticketStatus: s.tickets.some(t => t.status === 'OPEN') ? 'OPEN' : 'CLOSED',
    }))

    return res.status(200).json({ students: result })

  } catch (err) {
    console.error('[/api/admin/students] Error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}