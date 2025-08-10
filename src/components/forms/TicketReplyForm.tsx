'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Textarea from '@/components/ui/Textarea'

interface Props {
  ticketId: number
}

export default function TicketReplyForm({ ticketId }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (message.trim().length < 1) {
      return setError('Reply cannot be empty.')
    }

    setError('')
    setLoading(true)

    try {
      await axios.post(`/api/students/tickets/${ticketId}/reply`, {
        message: message.trim(),
      })
      setMessage('')
      router.refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to send reply.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your reply…"
        placeholderClassName="placeholder:font-bold placeholder-gray-600 placeholder-opacity-100"
        className="w-full h-24 resize-y text-gray-800"
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Sending…' : 'Send Reply'}
      </button>
    </form>
  )
}
