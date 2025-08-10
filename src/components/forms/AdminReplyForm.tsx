'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Textarea from '@/components/ui/Textarea'

interface Props {
  ticketId: number
}

export default function AdminReplyForm({ ticketId }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading]   = useState(false)
  
  const [error, setError]       = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim().length < 1) {
      setError('Reply cannot be empty.')
      return
    }
    setLoading(true)
    setError(null)    
    try {
      await axios.post(`/api/admin/tickets/${ticketId}/reply`, { message: message.trim() })
      setMessage('')
      router.refresh()
    } catch (e) {
      if (axios.isAxiosError(e)) {
      setError(e.response?.data?.message || 'Failed to send reply.')
      } else if (e instanceof Error) {
        setError(e.message)
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
    onChange={e => {
      setError(null)
      setMessage(e.target.value)
    }}
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
