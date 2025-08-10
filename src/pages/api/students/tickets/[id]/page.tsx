'use client'

import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import Textarea from '../../../../../components/ui/Textarea'

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
    if (!message.trim()) {
      return setError('Reply cannot be empty.')
    }
    setError('')
    setLoading(true)
    try {
      await axios.post(`/api/students/tickets/${ticketId}/reply`, { message })
      setMessage('')
      router.refresh()
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      setError(axiosErr.response?.data?.message || 'Failed to send reply.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Textarea
        value={message}
        onChange={e => {
          setMessage(e.target.value)
          if (error) setError('')
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type your reply here..."
        rows={4}
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary flex items-center justify-center gap-2"
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {loading ? 'Sending…' : 'Send Reply'}
      </button>
    </form>
  )
}
