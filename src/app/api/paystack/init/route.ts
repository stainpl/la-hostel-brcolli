// src/app/api/paystack/init/route.ts
import { NextResponse } from 'next/server'

type InitPayload = {
  amount: number
  email: string
  callback_url?: string
  reference?: string
}

/* -------------------------
   Small runtime validators
   ------------------------- */
const isString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isEmail = (v: unknown): v is string => isString(v) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const isUrl = (v: unknown): v is string => {
  if (!isString(v)) return false
  try { new URL(v); return true } catch { return false }
}

function validateInitBody(body: unknown): { ok: true; data: InitPayload } | { ok: false; errors: string[] } {
  const errors: string[] = []
  if (typeof body !== 'object' || body === null) {
    return { ok: false, errors: ['Body must be an object'] }
  }
  const b = body as Record<string, unknown>

  if (!isNumber(b.amount) || !Number.isInteger(b.amount) || b.amount <= 0) {
    errors.push('amount must be a positive integer (smallest currency unit)')
  }
  if (!isEmail(b.email)) {
    errors.push('email must be a valid email address')
  }
  if (b.callback_url !== undefined && !isUrl(b.callback_url)) {
    errors.push('callback_url must be a valid URL when provided')
  }
  if (b.reference !== undefined && !isString(b.reference)) {
    errors.push('reference must be a non-empty string when provided')
  }

  if (errors.length) return { ok: false, errors }
  return {
    ok: true,
    data: {
      amount: b.amount as number,
      email: b.email as string,
      callback_url: b.callback_url as string | undefined,
      reference: b.reference as string | undefined,
    },
  }
}

/* -------------------------
   AUTH Helpers (placeholders)
   ------------------------- */

/*
Replace these placeholder helpers with your real auth logic.
Examples:
 - NextAuth: getServerSession(req, options)
 - Custom JWT: verifyJwt(token)
 - Cookie session lookup: getSessionFromCookie(req)
 - Role check: ensure user is admin
*/

// Example: NextAuth-style session check (server-side)
async function ensureAuthenticatedWithNextAuth(req: Request) {
  // import and use getServerSession from next-auth if you use it:
  // const session = await getServerSession(authOptions)
  // if (!session) throw new Error('Unauthorized')
  return { ok: true, user: { id: 'admin-id', role: 'admin' } } // placeholder
}

// Example: custom JWT check
async function ensureAuthenticatedWithJwt(req: Request) {
  // const auth = req.headers.get('authorization')?.split(' ')[1]
  // if (!auth) throw new Error('Unauthorized')
  // const payload = verifyJwt(auth) // your jwt verify function
  return { ok: true, user: { id: 'admin-id', role: 'admin' } } // placeholder
}

// Example: API key header
function ensureApiKey(req: Request) {
  const key = req.headers.get('x-api-key')
  if (!key || key !== process.env.MY_ADMIN_API_KEY) {
    return { ok: false, message: 'Invalid API key' }
  }
  return { ok: true, user: { id: 'cli', role: 'system' } }
}

/* -------------------------
   Route handler
   ------------------------- */

export async function POST(req: Request) {
  // 0) Optional: check server config
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET
  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // 1) AUTH - choose the helper that matches your app
  // const authResult = await ensureAuthenticatedWithNextAuth(req)
  // const authResult = await ensureAuthenticatedWithJwt(req)
  const authResult = ensureApiKey(req) // <-- swap to your real auth check

  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.message ?? 'Unauthorized' }, { status: 401 })
  }

  // 2) parse body safely
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 3) validate payload
  const validated = validateInitBody(body)
  if (!validated.ok) {
    return NextResponse.json({ error: 'Invalid payload', details: validated.errors }, { status: 400 })
  }
  const { amount, email, callback_url, reference } = validated.data

  // 4) server-side business logic (DB/logs/etc) - preserve your logic here
  try {
    // Example: generate or normalize reference if not provided
    const txReference = reference ?? `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    // Example: record pending transaction in DB
    // await savePendingTransaction({ reference: txReference, amount, email, userId: authResult.user.id })

    // Example: call Paystack
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, email, callback_url, reference: txReference }),
    })

    const data = await res.json()

    if (!res.ok) {
      // preserve Paystack response and status
      // optionally update DB with failure status
      return NextResponse.json({ error: data.message ?? 'Payment provider error', details: data }, { status: res.status })
    }

    // Success: persist Paystack response, update DB as needed
    // await markTransactionInitialized({ reference: txReference, providerResponse: data })

    return NextResponse.json(data, { status: 200 })
  } catch (err: unknown) {
    // Narrow error safely (no any)
    const message = err instanceof Error ? err.message : 'Unknown server error'
    // optional: log error server-side
    // await logError({ where: 'paystack/init', error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
