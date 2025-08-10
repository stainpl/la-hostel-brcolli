'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import axios, { AxiosError } from 'axios'

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

export default function PaymentClient({ studentId }: { studentId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const amountParam = searchParams?.get('amount')
  const roomIdParam = searchParams?.get('roomId')

  // Validate params early
  const amount = Number(amountParam)
  const roomId = Number(roomIdParam)
  if (!amountParam || !roomIdParam || isNaN(amount) || isNaN(roomId) || amount <= 0) {
    return <p className="text-red-500">Missing or invalid roomId or amount.</p>
  }

  const handlePay = async () => {
    if (loading) return // Prevent double click

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!paystackKey) {
      toast.error('Payment key missing')
      return
    }
    if (!window.PaystackPop) {
      toast.error('Payment service not loaded')
      return
    }

    setLoading(true)
    try {
      // Step 1: Initialize transaction
      const { data } = await axios.post<InitResponse>('/api/paystack/init', {
        roomId,
        studentId: Number(studentId),
      })

      if (!data.reference || !data.email) {
        throw new Error('Invalid init response')
      }

      // Step 2: Launch Paystack widget
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: data.email,
        amount: amount * 100, // Paystack expects kobo
        ref: data.reference,
        onClose: () => {
          toast('Payment popup closed.')
          setLoading(false)
          router.push('/dashboard/student')
        },
        callback: async (response) => {
          try {
            const verifyResp = await fetch(`/api/paystack/verify?reference=${response.reference}`)
            const result: VerifyResponse = await verifyResp.json()

            if (verifyResp.ok && result.success) {
              toast.success('Payment confirmed!')
            } else {
              toast.error(result.message || 'Payment verification failed')
            }
          } catch (e) {
            console.error('Verify error', e)
            toast.error('Could not verify payment')
          } finally {
            setLoading(false)
            router.push('/dashboard/student')
          }
        },
      })

      handler.openIframe()
    } catch (err) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : (err as Error).message
      toast.error(message || 'Payment initialization failed')
      console.error('Init error:', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="btn-primary w-full flex items-center justify-center"
    >
      {loading ? (
        <Spinner size={20} colorClass="text-white" />
      ) : (
        `Pay ₦${amount.toLocaleString()} Now`
      )}
    </button>
  )
}
