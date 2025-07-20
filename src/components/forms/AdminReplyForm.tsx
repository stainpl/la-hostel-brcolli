// src/components/forms/AdminReplyForm.tsx
'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Props {
  ticketId: number
}

export default function AdminReplyForm({ ticketId }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim().length < 1) {
      setError('Reply cannot be empty.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await axios.post(`/api/admin/tickets/${ticketId}/reply`, { message: message.trim() })
      setMessage('')
      router.refresh()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to send reply.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="input w-full h-24"
        placeholder="Type your reply..."
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
