// src/app/dashboard/admin/layout.tsx
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import AdminHeader from '../../../components/ui/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    // Not an admin → kick back to home
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
