'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Spinner from '../ui/Spinner'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('identifier')?.toString() ?? ''
    const password = form.get('password')?.toString() ?? ''

    const res = await signIn('credentials', {
      email,
      password,
      role: 'student',
      callbackUrl: '/dashboard/student',
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      toast.error("Invalid credentials. Please check your RegNo/Email and password.")
    } else {
      toast.success('Login successful!')
      router.push(res?.url || '/dashboard/student')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="identifier"
        type="text"
        placeholder="Email or Reg No"
        className="input"
        disabled={loading}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="input"
        disabled={loading}
        required
      />
      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center"
        disabled={loading}
      >
        {loading ? <Spinner size={20} colorClass="text-white" /> : 'Login'}
      </button>
    </form>
  )
}
