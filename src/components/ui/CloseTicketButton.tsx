// src/components/ui/CloseTicketButton.tsx
'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Props {
  ticketId: number
}

export default function CloseTicketButton({ ticketId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return
    setLoading(true)
    try {
      await axios.patch(`/api/admin/tickets/${ticketId}/close`)
      router.refresh()
    } catch (err) {
      console.error('Failed to close ticket', err)
      alert('Failed to close ticket.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="text-red-600 hover:underline text-sm"
    >
      {loading ? 'Closing…' : 'Close Ticket'}
    </button>
  )
}
