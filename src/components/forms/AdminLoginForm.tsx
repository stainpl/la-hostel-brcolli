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
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      role: 'admin',               
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
        {loading ? <Spinner size={20} colorClass="text-white" /> : 'Login'}
      </button>
    </form>
  )
}