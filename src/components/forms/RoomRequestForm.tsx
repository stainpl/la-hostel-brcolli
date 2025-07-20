// src/components/forms/RoomRequestForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import axios from 'axios'

type RoomOption = {
  id: number
  label: string
  price: number
}

export default function RoomRequestForm({
  options,
  studentId,
}: {
  options: RoomOption[]
  studentId: number
}) {
  const [roomId, setRoomId] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId) {
      toast.error('Please pick a room')
      return
    }

    setLoading(true)
    try {
      // 1) Tell your backend to lock in the room request
      const res = await axios.post<{ price: number }>(
        `/api/students/${studentId}/room-request`,
        { roomId }
      )

      // 2) On success, redirect to payment with the correct amount
      const amount = res.data.price
      router.push(
  `/payment?amount=${amount}&roomId=${roomId}&studentId=${studentId}`
)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to request room')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block font-medium">Select a Room</label>
      <select
        name="roomId"
        value={roomId}
        onChange={(e) => setRoomId(Number(e.target.value))}
        className="input w-full"
        disabled={loading}
        required
      >
        <option value="" disabled>
          -- pick one --
        </option>
        {options.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label} — ₦{r.price.toLocaleString()}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center"
        disabled={loading}
      >
        {loading ? <Spinner size={20} colorClass="text-white" /> : 'Request & Pay'}
      </button>
    </form>
  )
}
