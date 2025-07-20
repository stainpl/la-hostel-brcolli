// pages/api/admin/students.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type RawStudent = {
  id: number
  fullName: string
  regNo: string
  gender: 'MALE' | 'FEMALE'
  sessionYear: number
  email: string
  phone: string
  payment: { status: 'PAID' | 'PENDING' } | null
  tickets: Array<{ status: 'OPEN' | 'CLOSED' }>
}

type StudentDTO = {
  id: number
  fullName: string
  regNo: string
  gender: 'MALE' | 'FEMALE'
  sessionYear: number
  email: string
  phone: string
  paymentStatus: 'PAID' | 'PENDING'
  ticketStatus: 'OPEN' | 'CLOSED'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req
  const id = Array.isArray(query.id) ? query.id[0] : query.id

  try {
    if (method === 'GET') {
      const students = (await prisma.student.findMany({
        select: {
          id: true,
          fullName: true,
          regNo: true,
          gender: true,
          sessionYear: true,
          email: true,
          phone: true,
          payment: true,
          tickets: true,
        },
        orderBy: { fullName: 'asc' },
      })) as RawStudent[]

      const result: StudentDTO[] = students.map((s: RawStudent) => ({
        id:            s.id,
        fullName:      s.fullName,
        regNo:         s.regNo,
        gender:        s.gender,
        sessionYear:   s.sessionYear,
        email:         s.email,
        phone:         s.phone,
        paymentStatus: s.payment?.status ?? 'PENDING',
        ticketStatus:  s.tickets.some((t: { status: string }) => t.status === 'OPEN') 
                        ? 'OPEN' 
                        : 'CLOSED',
      }))

      return res.status(200).json(result)
    }

    // ... other methods unchanged ...

  } catch (err: any) {
    console.error('[/api/admin/students] Error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
