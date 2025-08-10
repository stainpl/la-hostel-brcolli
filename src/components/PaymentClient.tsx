'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import axios from 'axios'

declare global {
  interface Window {
    PaystackPop?: any
  }
}

export default function PaymentClient({ studentId }: { studentId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const amountParam = searchParams?.get('amount')
  const roomIdParam = searchParams?.get('roomId')

  if (!amountParam || !roomIdParam) {
    return <p className="text-red-500">Missing or invalid roomId or amount.</p>
  }

  const amount = Number(amountParam)
  const roomId = Number(roomIdParam)

  if (isNaN(amount) || isNaN(roomId) || amount <= 0) {
    return <p className="text-red-500">Invalid roomId or amount.</p>
  }

  const handlePay = async () => {
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error('Payment key missing')
      return
    }

    setLoading(true)
    try {
      // Step 1: Initialize transaction
      const { data } = await axios.post('/api/paystack/init', {
        roomId,
        studentId: Number(studentId),
      })

      const { reference, email } = data
      if (!reference || !email) {
        throw new Error('Invalid init response')
      }

      // Step 2: Check PaystackPop availability
      if (!window.PaystackPop) {
        throw new Error('Payment service not loaded')
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // kobo
        ref: reference,
        onClose: () => {
          toast('Payment popup closed.')
          setLoading(false)
          router.push('/dashboard/student')
        },
        callback: async (response: { reference: string }) => {
          try {
            const verifyResp = await fetch(`/api/paystack/verify?reference=${response.reference}`)
            const result = (await verifyResp.json()) as { success: boolean; message?: string }

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
    } catch (err: any) {
      console.error('Init error:', err)
      toast.error(err.response?.data?.message || err.message || 'Payment initialization failed')
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
