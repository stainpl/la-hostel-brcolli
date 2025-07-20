// src/app/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import ParticleBackground from '@/components/ui/ParticleBackground'
import NavBar from '@/components/ui/NavBar'
import RegistrationForm from '@/components/forms/RegistrationForm'
import LoginForm from '@/components/forms/LoginForm'
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm'
import AdminLoginForm from '@/components/forms/AdminLoginForm'

type View = 'login' | 'register' | 'forgot' | 'admin'

export default function HomePage() {
  const [view, setView] = useState<View>('login')

  const renderForm = () => {
    switch (view) {
      case 'login': return <LoginForm />
      case 'register': return <RegistrationForm />
      case 'forgot': return <ForgotPasswordForm />
      case 'admin': return <AdminLoginForm />
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <ParticleBackground />

      {/* Main flex container: text left, form right */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen px-4">

        {/* Left: Hero Text */}
        <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Welcome to Your AP Hostel App
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-md mx-auto lg:mx-0">
            Efficiently manage bookings, payments, and communications—all in one place.
          </p>
        </div>

        {/* Right: Form Card */}
        <div className="flex-1 max-w-md w-full bg-white/90 text-black rounded-2xl p-6 sm:p-8 shadow-xl">

          {/* Switcher Tabs */}
          <div className="flex justify-between mb-6">
            <button
              className={`flex-1 py-2 text-center ${view === 'login' ? 'border-b-2 border-indigo-600 font-semibold' : 'text-gray-600'}`}
              onClick={() => setView('login')}
            >User Login</button>
            <button
              className={`flex-1 py-2 text-center ${view === 'register' ? 'border-b-2 border-indigo-600 font-semibold' : 'text-gray-600'}`}
              onClick={() => setView('register')}
            >Register</button>
          </div>

          {/* Conditionally show “Forgot password?” link */}
          {view === 'login' && (
            <div className="text-right mb-4">
              <button
                onClick={() => setView('forgot')}
                className="text-sm text-indigo-600 hover:underline"
              >Forgot password?</button>
            </div>
          )}

          {/* Active Form */}
          {renderForm()}

          {/* Admin Login Switch */}
          <div className="mt-6 pt-4 border-t border-gray-300">
            <button
              onClick={() => setView('admin')}
              className="w-full text-sm text-gray-700 hover:underline"
            >Admin Login</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 w-full text-center text-white/70 text-xs sm:text-sm">
        © {new Date().getFullYear()} Your Hostel Management. All rights reserved.
      </footer>
    </div>
  )
}
