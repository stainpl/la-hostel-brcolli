// pages/api/admin/payments/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession }            from 'next-auth/next'
import { authOptions }                 from '@/pages/api/auth/[...nextauth]'
import { prisma }                      from '@/lib/prisma'
import { withLogging }                 from '@/lib/withLogging'
import { sendPaymentReceipt }          from '@/lib/mailer'
import { Prisma }                      from '@prisma/client'



async function handler(req: NextApiRequest, res: NextApiResponse) {
  // guard: ensure admin is logged in
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const adminId = Number(session.user.id)

  // ─── GET: search student or list recent payments
  if (req.method === 'GET') {
  const { q, page } = req.query

  // 1) If there's a q string, return that student
  if (typeof q === 'string' && q.trim()) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { fullName:    { contains: q, mode: 'insensitive' } },
          { email:       { contains: q, mode: 'insensitive' } },
          { regNo:       { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id:          true,
        fullName:    true,
        email:       true,
        hasPaid:     true,
        sessionYear: true,
        room: {
          select: {
            id:     true,
            block:  true,
            number: true,
            price:  true,
          },
        },
      },
    })
    return res.status(200).json({ student })
  }

  // 2) No q → return payments in pages of 20
  const TAKE    = 15
  const pageNum = Math.max(1, parseInt((page as string) || '1', 10))
  const skip    = (pageNum - 1) * TAKE

  // Count total and fetch current page in parallel
  const [ total, payments ] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: TAKE,
      include: {
        student: {
          select: {
            fullName:    true,
            email:       true,
            sessionYear: true,
            room: {
              select: { block: true, number: true },
            },
          },
        },
        admin: {
          select: { email: true },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(total / TAKE)
  return res.status(200).json({ payments, page: pageNum, totalPages })
}

  // ─── POST: manually mark student paid 
  if (req.method === 'POST') {
    const { studentId } = req.body as { studentId?: number }
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' })
    }

    // grab student + room + hasPaid + sessionYear
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        fullName:    true,
        email:       true,
        hasPaid:     true,
        sessionYear: true,
        room: {
          select: {
            id:     true,
            block:  true,
            number: true,
            price:  true,
          },
        },
      },
    })

    if (!student || !student.room) {
      return res.status(400).json({ message: 'Student or room not found' })
    }
    if (student.hasPaid) {
      return res.status(409).json({ message: 'Student has already paid' })
    }

    // build payment details
    const reference = `manual_${Date.now()}`
    const amount    = student.room.price * 100 

    // Use the unchecked input so TS knows raw FKs are allowed:
    const payment = await prisma.payment.create({
      data: {
        reference,
        amount,
        method:      'manual',
        status:      'confirmed',
        studentId,                    
        adminId,                      
        roomId: student.room.id,    
        sessionYear: student.sessionYear, 
      } as Prisma.PaymentUncheckedCreateInput,
    })

    // mark student as paid in their record
    await prisma.student.update({
      where: { id: studentId },
      data:  { hasPaid: true },
    })

    // send email receipt
    await sendPaymentReceipt({
      to:           student.email!,
      studentName:  student.fullName,
      roomBlock:    student.room.block,
      roomNumber:   student.room.number,
      amount,
      reference,
      date:         new Date(),
    })

    return res.status(201).json({ payment })
  }

  // ─── FALLBACK ───────────────────────────────────────────────────────────────────
  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}

export default withLogging(handler, 'admin.payments')