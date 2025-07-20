import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function POST(req: Request) {
  try {
    const { roomId: rawRoomId, studentId: rawStudentId } = await req.json()
    const roomId    = Number(rawRoomId)
    const studentId = Number(rawStudentId)
    if (!roomId || !studentId) {
      return NextResponse.json(
        { message: 'Missing or invalid roomId or studentId' },
        { status: 400 }
      )
    }

    // Load room & student (including sessionYear)
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { email: true, sessionYear: true },
    })
    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 })
    }
    if (!student?.email) {
      return NextResponse.json({ message: 'Student not found or missing email' }, { status: 404 })
    }

    const reference = `hstl_${Date.now()}`

    // Create pending payment, now including sessionYear
    await prisma.payment.create({
      data: {
        reference,
        amount:      room.price * 100,     // in kobo
        studentId,
        roomId,
        status:      'pending',
        method:      'init',
        sessionYear: student.sessionYear,   // ← include this
      },
    })

    // Initialize Paystack transaction
    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:        student.email,
        amount:       room.price * 100,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paystack/callback`,
      }),
    })
    const initData = await initRes.json()
    if (!initRes.ok || initData.status !== true) {
      console.error('Paystack init failed:', initData)
      return NextResponse.json(
        { message: initData.message || 'Paystack initialization failed' },
        { status: initRes.status || 500 }
      )
    }

    return NextResponse.json({
      authorization_url: initData.data.authorization_url,
      reference,
      email:             student.email,
    })
  } catch (err: any) {
    console.error('[/api/paystack/init] unexpected error:', err)
    return NextResponse.json(
      { message: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
