'use client'
import { useState } from 'react'
import Spinner from '../ui/Spinner'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Replace this with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500)) // fake delay for UI feedback
      toast.success('Password reset link sent! Check your email.')
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        className="input"
        required
        disabled={loading}
      />
      <button type="submit" className="btn-primary w-full flex items-center justify-center" disabled={loading}>
        {loading ? <Spinner size={20} colorClass="text-white" /> : 'Send Reset Link'}
      </button>
    </form>
  )
}