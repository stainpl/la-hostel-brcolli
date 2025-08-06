// src/app/(auth)/admin-login/page.tsx
'use client'

import AdminLoginForm from '@/components/forms/AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl mb-6 text-center">Admin Login</h1>
        <AdminLoginForm />
      </div>
    </div>
  )
}
