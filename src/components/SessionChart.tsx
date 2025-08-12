'use client'

import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import { toast } from 'react-hot-toast'
import axios from 'axios'

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackOptions) => { openIframe: () => void }
    }
  }
}

interface PaystackOptions {
  key: string
  email: string
  amount: number
  ref: string
  onClose: () => void
  callback: (response: { reference: string }) => void
}

interface InitResponse {
  reference: string
  email: string
}

interface VerifyResponse {
  success: boolean
  message?: string
}

const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v1/inline.js'

/** Dynamically load Paystack script and resolve when available */
function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.PaystackPop) return resolve()

    // avoid injecting the script multiple times
    const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => (window.PaystackPop ? resolve() : reject(new Error('Paystack failed to load'))))
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack script')))
      return
    }

    const script = document.createElement('script')
    script.src = PAYSTACK_SCRIPT_SRC
    script.async = true
    script.onload = () => (window.PaystackPop ? resolve() : reject(new Error('Paystack not available after load')))
    script.onerror = () => reject(new Error('Failed to load Paystack script'))
    document.body.appendChild(script)
  })
}

export default function PaymentClient({ studentId }: { studentId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // script load state
  const [scriptLoading, setScriptLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(() => typeof window !== 'undefined' && Boolean(window.PaystackPop))

  // keep a mounted ref so async callbacks don't update state after unmount
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const amountParam = searchParams?.get('amount') ?? ''
  const roomIdParam = searchParams?.get('roomId') ?? ''

  // parse once and memoize
  const { amount, roomId, invalidReason } = useMemo(() => {
    const a = Number(amountParam)
    const r = Number(roomIdParam)
    if (!amountParam || !roomIdParam) {
      return { amount: NaN, roomId: NaN, invalidReason: 'Missing amount or roomId' }
    }
    if (Number.isNaN(a) || Number.isNaN(r)) {
      return { amount: NaN, roomId: NaN, invalidReason: 'Invalid amount or roomId' }
    }
    if (a <= 0) {
      return { amount: a, roomId: r, invalidReason: 'Amount must be greater than 0' }
    }
    return { amount: a, roomId: r, invalidReason: null as string | null }
  }, [amountParam, roomIdParam])

  if (invalidReason) {
    return <p className="text-red-500">Missing or invalid roomId or amount: {invalidReason}</p>
  }

  // Try to pre-load the script once on mount (non-blocking)
  useEffect(() => {
    if (scriptLoaded || scriptLoading) return
    setScriptLoading(true)
    loadPaystackScript()
      .then(() => {
        if (!mountedRef.current) return
        setScriptLoaded(true)
      })
      .catch((err) => {
        console.warn('Paystack script preload failed:', err)
      })
      .finally(() => {
        if (!mountedRef.current) return
        setScriptLoading(false)
      })
  }, [scriptLoaded, scriptLoading])

  const handlePay = useCallback(async () => {
    if (loading) return // prevent double clicks
    setLoading(true)

    try {
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
      if (!paystackKey) {
        toast.error('Payment key missing')
        return
      }

      // ensure Paystack script is available — attempt to load if not
      if (!window.PaystackPop) {
        try {
          setScriptLoading(true)
          await loadPaystackScript()
          if (!mountedRef.current) return
          setScriptLoaded(true)
        } catch (err) {
          console.error('Failed to load Paystack script', err)
          toast.error('Payment service failed to load. Try again later.')
          return
        } finally {
          if (mountedRef.current) setScriptLoading(false)
        }
      }

      if (!window.PaystackPop) {
        toast.error('Payment service not available')
        return
      }

      // Step 1: Initialize transaction on server
      const { data } = await axios.post<InitResponse>('/api/paystack/init', {
        roomId,
        studentId: Number(studentId),
      })

      if (!data || !data.reference || !data.email) {
        throw new Error('Invalid init response from server')
      }

      // Step 2: Launch Paystack widget
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: data.email,
        amount: Math.round(amount * 100), // Paystack expects kobo (integer)
        ref: data.reference,
        onClose: () => {
          // only update if still mounted
          if (!mountedRef.current) return
          toast('Payment popup closed.')
          setLoading(false)
          router.push('/dashboard/student')
        },
        callback: async (response) => {
          // verify with server
          try {
            const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(response.reference)}`)
            const result = (await res.json()) as VerifyResponse

            if (res.ok && result.success) {
              toast.success('Payment confirmed!')
            } else {
              toast.error(result.message || 'Payment verification failed')
            }
          } catch (err) {
            console.error('Verify error', err)
            toast.error('Could not verify payment')
          } finally {
            if (!mountedRef.current) return
            setLoading(false)
            router.push('/dashboard/student')
          }
        },
      } as PaystackOptions)

      // open the iframe (guarding if handler isn't available)
      if (handler?.openIframe) {
        handler.openIframe()
      } else {
        throw new Error('Payment handler not available')
      }
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err)
          ? (err.response?.data?.message as string) ?? err.message
          : err instanceof Error
          ? err.message
          : String(err)
      toast.error(message || 'Payment initialization failed')
      console.error('Init error:', err)
    } finally {
      // ensure we only update state if still mounted
      if (mountedRef.current) setLoading(false)
    }
  }, [amount, roomId, studentId, loading, router])

  const buttonLabel = scriptLoading
    ? 'Loading payment…'
    : loading
    ? 'Processing…'
    : `Pay ₦${amount.toLocaleString()} Now`

  return (
    <button
      onClick={handlePay}
      disabled={loading || scriptLoading}
      className="btn-primary w-full flex items-center justify-center"
    >
      {loading || scriptLoading ? (
        <Spinner size={20} colorClass="text-white" />
      ) : (
        buttonLabel
      )}
    </button>
  )
}
