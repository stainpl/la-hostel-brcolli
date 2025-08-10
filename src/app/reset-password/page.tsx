'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import { toast } from 'react-hot-toast'

interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''

  const [form, setForm] = useState<ResetPasswordForm>({
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordForm, string>>>({})
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [validToken, setValidToken] = useState(false)

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false)
      setValidToken(false)
      return
    }
    fetch(`/api/auth/validate-reset?token=${encodeURIComponent(token)}`)
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
          <h2 className="text-2xl font-semibold mb-4 text-red-500">
            Invalid or Expired Link
          </h2>
          <p className="text-gray-600">Please request a new password reset.</p>
        </div>
      </div>
    )
  }

  // Simple validation without external libs
  const validateForm = (data: ResetPasswordForm) => {
    const newErrors: Partial<Record<keyof ResetPasswordForm, string>> = {}

    if (!data.newPassword || data.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters.'
    }
    if (data.newPassword !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(form)) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
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
        <h1 className="text-2xl font-bold text-left text-green-600">
          Reset Password
        </h1>

        {/* New Password */}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            id="new-password"
            value={form.newPassword}
            onChange={e => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
            required
            minLength={6}
            disabled={loading}
            placeholder="••••••••"
            className={`w-full mt-1 px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.newPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm-password"
            value={form.confirmPassword}
            onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
            minLength={6}
            disabled={loading}
            placeholder="••••••••"
            className={`w-full mt-1 px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
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
