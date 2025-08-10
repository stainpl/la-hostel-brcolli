// src/app/api/paystack/webhook/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

type PaystackEvent = {
  event?: unknown
  data?: unknown
}

/**
 * Type guard for charge.success event with a reference string
 */
function isChargeSuccessEvent(
  payload: unknown
): payload is { event: 'charge.success'; data: { reference: string } } {
  if (!isObject(payload)) return false
  if (typeof payload.event !== 'string') return false
  if (payload.event !== 'charge.success') return false
  if (!isObject(payload.data)) return false
  return typeof payload.data.reference === 'string'
}


function getEventName(payload: unknown): string | undefined {
  if (!isObject(payload)) return undefined
  const ev = payload['event']
  return typeof ev === 'string' ? ev : undefined
}

export async function POST(request: Request) {
  // 1) Read raw body for signature verification
  const bodyText = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''

  // 2) Ensure secret exists
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    console.error('[PAYSTACK WEBHOOK] missing PAYSTACK_SECRET_KEY env')
    return NextResponse.json({ message: 'Server misconfiguration' }, { status: 500 })
  }

  // 3) Compute HMAC and compare using timingSafeEqual
  const computed = crypto.createHmac('sha512', secret).update(bodyText).digest('hex')

  // timingSafeEqual requires buffers of same length
  const sigBuffer = Buffer.from(signature, 'utf8')
  const compBuffer = Buffer.from(computed, 'utf8')
  if (sigBuffer.length !== compBuffer.length || !crypto.timingSafeEqual(sigBuffer, compBuffer)) {
    console.error('⚠️ Webhook signature mismatch', { signature, computed })
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  // 4) Parse JSON safely
  let eventPayload: unknown
  try {
    eventPayload = JSON.parse(bodyText) as PaystackEvent
  } catch (e) {
    console.error('⚠️ Webhook JSON parse error', e)
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  // 5) Handle only successful charges (with safe narrowing)
  if (isChargeSuccessEvent(eventPayload)) {
    const reference = eventPayload.data.reference

    try {
      // mark payment record as paid
      const payment = await prisma.payment.update({
        where: { reference },
        data: { status: 'paid', updatedAt: new Date() },
      })

      // mark student as paid (optional)
      await prisma.student.update({
        where: { id: payment.studentId },
        data: { hasPaid: true },
      })

      console.log(`✅ Webhook: payment ${reference} recorded as paid`)
    } catch (err: unknown) {
      // log but do not return an error to Paystack — keep returning 200
      console.error('❌ Webhook handler error', err instanceof Error ? err.message : err)
      // optionally: capture to Sentry / monitoring here
    }
  } else {
    // Not a charge.success event or payload shape mismatch — ignore
    const eventName = getEventName(eventPayload)
    console.log('ℹ️ Webhook received, ignored (not charge.success)', {
      event: eventName ?? typeof eventPayload,
    })
  }

  // 6) Always acknowledge receipt (200) so provider doesn't keep retrying
  return NextResponse.json({ received: true }, { status: 200 })
}
