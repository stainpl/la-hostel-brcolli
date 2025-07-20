// src/components/ui/StudentHeader.tsx
'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function StudentHeader() {
  return (
    <nav className="bg-white shadow px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-semibold text-gray-800">
        Hostel Portal
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  )
}
