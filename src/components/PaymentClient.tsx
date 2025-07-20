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

  const amountKobo = Number(amountParam) * 100
  const roomId = Number(roomIdParam)

  if (isNaN(amountKobo) || isNaN(roomId)) {
    return <p className="text-red-500">Invalid roomId or amount.</p>
  }

  const handlePay = async () => {
    setLoading(true)
    try {
      // Step 1: Initialize transaction on server
      const { data } = await axios.post('/api/paystack/init', {
        roomId,
        studentId: Number(studentId),
      })

      const { reference, email } = data
      if (!reference || !email) {
        throw new Error('Invalid init response')
      }

      // Step 2: Use Paystack inline pop-up
      const Paystack = window.PaystackPop
      if (!Paystack) {
        throw new Error('PaystackPop not loaded')
      }

      const handler = new Paystack()
      handler.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email,
        amount: amountKobo,
        ref: reference,
        onClose: () => {
          setLoading(false)
          router.push('/dashboard/student')
        },
        callback: async ({ reference }: { reference: string }) => {
          try {
            // 1. Verify payment with server
            const resp = await fetch(`/api/paystack/verify?reference=${reference}`)
            const result = await resp.json() as { success: boolean; message?: string }
            // 2. Show appropriate toast
            if (resp.ok && result.success) {
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
        `Pay ₦${Number(amountParam).toLocaleString()} Now`
      )}
    </button>
  )
}