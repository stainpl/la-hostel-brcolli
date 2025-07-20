'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Spinner from '../ui/Spinner'

export default function AdminLoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Call the "credentials" provider and pass role="admin"
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      role: 'admin',               // ← tell NextAuth this is an admin login
      callbackUrl: '/dashboard/admin',
      redirect: false,
    })
    setLoading(false)

    if (res?.error) {
      toast.error('Login failed: ' + res.error)
    } else {
      toast.success('Login successful!')
      router.push(res?.url || '/dashboard/admin')
    }
    // otherwise, NextAuth will navigate to callbackUrl
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Admin Email"
        className="input"
        required
        disabled={loading}
      />
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="input"
        required
        disabled={loading}
      />
      <button type="submit" className="btn-secondary w-full flex items-center justify-center" disabled={loading}>
        {loading ? <Spinner size={20} colorClass="text-white" /> : 'Admin Login'}
      </button>
    </form>
  )
}