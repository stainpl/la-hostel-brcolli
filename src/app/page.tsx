// src/app/page.tsx
'use client'

import { useState } from 'react'
import ParticleBackground from '@/components/ui/ParticleBackground'
import RegistrationForm from '@/components/forms/RegistrationForm'
import LoginForm from '@/components/forms/LoginForm'
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm'
import AdminLoginForm from '@/components/forms/AdminLoginForm'

// …


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
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-hidden">
      <ParticleBackground />
      

      <main className="relative z-10 container mx-auto flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-64px)] px-6">
        {/* Hero Section */}
        <section className="flex-1 mb-10 lg:mb-0 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-snug tracking-tight">
            AP Hostel Management
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-300 max-w-lg mx-auto lg:mx-0">
            Streamline bookings, payments, and communication in one sleek dashboard.
          </p>
        </section>

        {/* Form Card */}
        <section className="flex-1 max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Tab Switcher */}
          <div className="flex bg-white/20 rounded-full p-1 mb-6">
            {['login', 'register'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab as View)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${view === tab
                    ? 'bg-white text-gray-900 shadow-inner'
                    : 'text-gray-200 hover:bg-white/30'
                  }`}
              >
                {tab === 'login' ? 'User Login' : 'Register'}
              </button>
            ))}
          </div>

          {/* Forgot Link */}
          {view === 'login' && (
            <div className="text-right mb-4">
              <button
                onClick={() => setView('forgot')}
                className="text-xs text-indigo-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Active Form */}
          <div>
            {renderForm()}
          </div>

          {/* Admin Switch */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <button
              onClick={() => setView('admin')}
              className="w-full text-xs text-gray-200 hover:underline"
            >
              Admin Login
            </button>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-4 w-full text-center text-gray-400 text-xs">
        © {new Date().getFullYear()} by Silas. T
      </footer>
    </div>
  )
}
