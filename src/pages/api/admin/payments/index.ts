// src/pages/api/admin/payments/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession }            from 'next-auth/next'
import { authOptions }                 from '@/pages/api/auth/[...nextauth]'
import { prisma }                      from '@/lib/prisma'
import { withLogging }                 from '@/lib/withLogging'
import { sendPaymentReceipt }          from '@/lib/mailer'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 0) Auth – only admins
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const adminId = Number(session.user.id)

  // 1) GET: search or list recent payments
  if (req.method === 'GET') {
    const { q } = req.query

    if (typeof q === 'string' && q.trim()) {
      // --- Perform student lookup ---
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { email:    { contains: q, mode: 'insensitive' } },
            { regNo:    { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id:          true,
          fullName:    true,
          email:       true,
          sessionYear: true,
          hasPaid:     true,
          room: {
            select: {
              block:  true,
              number: true,
            },
          },
        },
      })
      return res.status(200).json({ student })
    }

    // --- No query: return recent payments ---
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
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
    })
    return res.status(200).json({ payments })
  }

  // 2) POST: manually mark a student paid
  if (req.method === 'POST') {
    const { studentId } = req.body as { studentId?: number }
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' })
    }

    const student = await prisma.student.findUnique({
      where:   { id: studentId },
      include: { room: true },
    })
    if (!student || !student.room) {
      return res.status(400).json({ message: 'Student or room not found' })
    }
    if (student.hasPaid) {
      return res.status(409).json({ message: 'Student has already paid' })
    }

    // build & save the payment
    const reference = `manual_${Date.now()}`
    const amount    = student.room.price * 100  // in kobo
    const payment = await prisma.payment.create({
      data: {
        studentId,
        adminId,                  // now optional in your schema
        roomId:      student.room.id,
        amount,
        reference,
        method:      'manual',
        status:      'confirmed',
        sessionYear: student.sessionYear, // now string in both models
      },
    })

    // mark the student paid
    await prisma.student.update({
      where: { id: studentId },
      data:  { hasPaid: true },
    })

    // send receipt email
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

  // 3) Fallback: method not allowed
  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}

export default withLogging(handler, 'admin.payments')
