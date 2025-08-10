'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import { toast } from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [validToken, setValidToken] = useState(false)

  // 1. Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false)
      setValidToken(false)
      return
    }
    fetch(`/api/auth/validate-reset?token=${token}`)
      .then(res => res.json())
      .then(({ valid }) => setValidToken(valid))
      .catch(() => setValidToken(false))
      .finally(() => setValidating(false))
  }, [token])

  if (validating) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size={40} />
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-sm">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">Invalid or Expired Link</h2>
          <p className="text-gray-600">Please request a new password reset.</p>
        </div>
      </div>
    )
  }

  // 2. Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters.')
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Reset failed')
      }
      toast.success('Password reset! Redirecting…')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-left text-green-600">Reset Password</h1>

        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            placeholder="••••••••"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            placeholder="••••••••"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Spinner size={20} colorClass="text-white" /> : 'Submit'}
        </button>
      </form>
    </div>
  )
}
