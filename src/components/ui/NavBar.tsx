// src/components/ui/NavBar.tsx
'use client'

import { FC } from 'react'

type View = 'login' | 'register' | 'admin'
interface NavBarProps {
  current: View
  onChange: (v: View) => void
}

const items: { label: string; view: View }[] = [
  { label: 'Student Login', view: 'login' },
  { label: 'Register',       view: 'register' },
  { label: 'Admin Login',    view: 'admin' },
]

const NavBar: FC<NavBarProps> = ({ current, onChange }) => (
  <nav className="fixed top-0 left-0 w-full bg-gray-500 backdrop-blur-md z-20">
    <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
      {/* Left side text */}
      <p className="text-gray-800 font-lg">
        Welcome to Student Hostel Portal
      </p>

      {/* Right side links */}
      <div className="flex space-x-4">
        {items.map((item) => (
          <button
            key={item.view}
            onClick={() => onChange(item.view)}
            className={
              current === item.view
                ? 'px-4 py-2 rounded-full bg-indigo-600 text-white'
                : 'px-4 py-2 rounded-full text-gray-700 hover:bg-gray-200'
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  </nav>
)

export default NavBar
