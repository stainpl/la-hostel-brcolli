// src/app/api/paystack/callback/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
 
export async function GET(request: Request) {
  const url = new URL(request.url)
  const reference = url.searchParams.get('reference')
  if (!reference) {
    return NextResponse.redirect(new URL('/dashboard/student?error=NoRef', request.url))
  }

  // 1) Verify with Paystack
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  })
  const data = await res.json()
  if (!data.status || data.data.status !== 'success') {
    await prisma.payment.update({
      where: { reference },
      data: { status: 'failed' },
    })
    return NextResponse.redirect(new URL('/dashboard/student?error=PaymentFailed', request.url))
  }

  // 2) Mark payment success
  const pay = await prisma.payment.update({
    where: { reference },
    data: { status: 'success' },
  })
  // 3) Mark student paid & allocate room
  await prisma.student.update({
    where: { id: pay.studentId },
    data: { hasPaid: true, roomId: pay.roomId },
  })
  // 4) Mark room filled if needed
  const room = await prisma.room.findUnique({
    where: { id: pay.roomId },
    include: { students: true },
  })
  if (room && room.students.length >= 5) {
    await prisma.room.update({
      where: { id: room.id },
      data: { isFilled: true },
    })
  }

  return NextResponse.redirect(new URL('/dashboard/student?success=Paid', request.url))
}
