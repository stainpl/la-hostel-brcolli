// src/components/ui/AdminHeader.tsx
'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function AdminHeader() {
  return (
    <header className="bg-gray-500 shadow p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Wellcome Admin</h1>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  )
}
