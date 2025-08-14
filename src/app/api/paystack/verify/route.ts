export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentReceipt } from '@/lib/mailer'

type PaystackVerifyBody = {
  status?: boolean
  message?: string
  data?: {
    status?: string
    reference?: string
    amount?: number
    [k: string]: unknown
  }
}


const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

function isPaystackSuccess(body: unknown): body is PaystackVerifyBody {
  if (!isObject(body)) return false
  const status = body['status']
  const data = body['data']
  if (status !== true) return false
  if (!isObject(data)) return false
  const paymentStatus = data['status']
  return paymentStatus === 'success'
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Missing reference parameter' },
        { status: 400 }
      )
    }

    // 1) Verify with Paystack
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      console.error('[VERIFY PAYSTACK] missing PAYSTACK_SECRET_KEY env')
      return NextResponse.json(
        { success: false, message: 'Server misconfiguration' },
        { status: 500 }
      )
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    })

    let body: unknown
    try {
      body = await res.json()
    } catch (parseErr) {
      console.error('[VERIFY PAYSTACK] failed to parse JSON:', parseErr)
      return NextResponse.json(
        { success: false, message: 'Invalid response from payment provider' },
        { status: 502 }
      )
    }

    console.log('🔍 Paystack verify response:', body)

    // validate shape & success
    if (!res.ok || !isPaystackSuccess(body)) {
      const providerMessage =
        isObject(body) && typeof body['message'] === 'string' ? (body['message'] as string) : undefined
      return NextResponse.json(
        { success: false, message: providerMessage ?? 'Payment not successful' },
        { status: 400 }
      )
    }

    // At this point we know body is PaystackVerifyBody and has data
    const payData = (body as PaystackVerifyBody).data!
    // optional: validate that the reference in response matches the requested reference
    if (payData.reference && payData.reference !== reference) {
      console.warn(
        `[VERIFY PAYSTACK] reference mismatch: requested=${reference} provider=${payData.reference}`
      )
    }

    // 2) Update Payment record
    const payment = await prisma.payment.update({
      where: { reference },
      data: { status: 'success' },
    })

    // 3) Assign room and mark hasPaid
    await prisma.student.update({
      where: { id: payment.studentId },
      data: {
        roomId: payment.roomId,
        hasPaid: true,
      },
    })

    // 4) Send receipt email
    const student = await prisma.student.findUnique({
      where: { id: payment.studentId },
      select: { fullName: true, email: true },
    })

    if (student && student.email) {
      const room = await prisma.room.findUnique({ where: { id: payment.roomId } })
      try {
        await sendPaymentReceipt({
          to: student.email,
          studentName: student.fullName,
          roomBlock: room?.block || '',
          roomNumber: room?.number || 0,
          amount: payment.amount / 100,
          reference,
          date: payment.createdAt,
        })
      } catch (mailErr) {
        console.error('[VERIFY PAYSTACK] failed to send receipt email', mailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[VERIFY PAYSTACK ERROR]', err)
    const message = err instanceof Error ? err.message : 'Server error during verification'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
