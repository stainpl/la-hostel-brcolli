// src/components/ui/Header.tsx
'use client'

import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Student Login', view: 'login' },
  { label: 'Register',      view: 'register' },
  { label: 'Admin Login',   view: 'admin' },
] as const

type View = 'login' | 'register' | 'forgot' | 'admin'

interface HeaderProps {
  current: View
  onChange: (view: View) => void
}

export default function Header({ current, onChange }: HeaderProps) {
  return (
    <header className="relative z-10 w-full max-w-2xl mx-auto mt-8 flex justify-center space-x-8">
      {navItems.map(({ label, view }) => (
        <button
          key={view}
          onClick={() => onChange(view)}
          className={`px-4 py-2 rounded-full transition ${
            current === view
              ? 'bg-indigo-600 text-white'
              : 'bg-white/30 text-white/80 hover:bg-white/50'
          }`}
        >
          {label}
        </button>
      ))}
    </header>
  )
}
