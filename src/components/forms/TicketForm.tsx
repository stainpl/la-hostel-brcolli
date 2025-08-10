'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  studentId: number
}

export default function TicketForm({ studentId }: Props) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (subject.trim().length < 3) return setError('Subject must be at least 3 characters.')
    if (message.trim().length < 20) return setError('Message must be at least 20 characters.')

    setError('')
    setLoading(true)

    try {
      const form = new FormData()
      form.append('studentId', studentId.toString())
      form.append('subject', subject.trim())
      form.append('message', message.trim())
      if (image) form.append('image', image)

      await axios.post('/api/students/tickets', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Reset form first, then refresh
      setSubject('')
      setMessage('')
      setImage(null)

      toast.success('Ticket opened successfully!')
      router.refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to open ticket.')
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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div>
        <label htmlFor="subject" className="block font-medium text-green-700">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="input w-full placeholder-gray-600 placeholder-opacity-100 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="message" className="block font-medium text-gray-800">Message</label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="input w-full h-32 placeholder-gray-600 placeholder-opacity-100 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="image" className="block font-medium text-gray-950">Image (optional)</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="mt-1"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center"
      >
        {loading ? 'Opening…' : 'Open Ticket'}
      </button>
    </form>
  )
}
