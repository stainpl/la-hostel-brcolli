// src/app/api/paystack/init/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/pages/api/auth/[...nextauth]'
import { prisma }           from '@/lib/prisma'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const CALLBACK_URL    = `${process.env.NEXT_PUBLIC_BASE_URL}/api/paystack/verify`

export async function POST(req: Request) {
  try {
    // 1) Ensure student is logged in
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const studentId = Number(session.user.id)

    // 2) Parse & validate body
    const { roomId } = await req.json() as { roomId?: number }
    if (!roomId || isNaN(roomId)) {
      return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 })
    }

    // 3) Lookup room and student
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { email: true, sessionYear: true },
    })
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    const nairaPrice = room!.price
    const koboAmount = nairaPrice * 100

    // 4) Create pending Payment record
    const reference = `hstl_${Date.now()}`
    const amountKobo = room.price * 100
    await prisma.payment.create({
      data: {
        reference,
        amount:      koboAmount,
        method:      'init',
        status:      'pending',
        studentId,
        roomId,
        sessionYear: String(student.sessionYear),
      },
    })

    // 5) Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:        student.email,
        amount:       amountKobo,
        reference,
        callback_url: CALLBACK_URL,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      console.error('[Paystack Init Error]', err)
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 502 })
    }

    const payload = await response.json()
    // 6) Return the Paystack authorization URL
    return NextResponse.json({
      authorization_url: payload.data.authorization_url,
      access_code:       payload.data.access_code,
      reference:         payload.data.reference,
    })
  } catch (e: any) {
    console.error('[api/paystack/init] error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
