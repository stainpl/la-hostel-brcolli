'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import Input from "@/components/ui/Input"

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params?.get('token') || ''
  const [valid, setValid] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // 1) Validate token on mount
  useEffect(() => {
    if (!token) {
      setValid(false)
      return
    }

    const validate = async () => {
      try {
        await axios.get(`/api/admin/admins/reset-password?token=${token}`)
        setValid(true)
      } catch (err: unknown) {
        // Narrow the error to give a helpful message, but don't use `any`
        if (axios.isAxiosError(err)) {
          // optional: check err.response?.status === 404 or error message
          setValid(false)
        } else {
          setValid(false)
        }
      }
    }

    validate()
  }, [token])

  // 2) Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setLoading(true)
    try {
      await axios.post('/api/admin/admins/reset-password', { token, password })
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (err: unknown) {
      // Properly narrow unknown to extract a message
      let message = 'Reset failed.'
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? err.message ?? message
      } else if (err instanceof Error) {
        message = err.message
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // 3) Render invalid page
  if (valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-500">Invalid or Expired Token</h2>
          <p>This reset link is no longer valid.</p>
        </div>
      </div>
    )
  }

  // 4) Success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">Password Reset!</h2>
          <p>You can now <a className="text-indigo-600 underline" href="/auth/login">log in</a> with your new password.</p>
        </div>
      </div>
    )
  }

  // 5) Loading or form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-green-500">Set a New Password</h2>
        {valid === null ? (
          <p>Validating link…</p>
        ) : valid === true ? (
          <>
            {error && <p className="mb-2 text-red-500">{error}</p>}
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-500">New Password</span>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border px-3 py-2 text-gray-800"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-500">Confirm Password</span>
              <Input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border px-3 py-2 text-gray-800"
              />
            </label>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </>
        ) : null}
      </form>
    </div>
  )
}