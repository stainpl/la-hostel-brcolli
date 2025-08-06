'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginForm() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [errorMsg, setErrorMsg]   = useState<string | null>(null)
  const router                    = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard/admin',
    })

    if (res?.error) {
      setErrorMsg('Invalid credentials')
    } else {
      
      router.push(res?.url || '/dashboard/admin')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
        required
      />

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <button type="submit" className="btn-secondary w-full">
        Login
      </button>
    </form>
  )
}
