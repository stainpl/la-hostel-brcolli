// src/components/ui/LogoutButton.tsx
'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
    >
      Logout
    </button>
  )
}
