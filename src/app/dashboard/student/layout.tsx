// src/app/dashboard/student/layout.tsx
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import StudentHeader from '../../../components/ui/StudentHeader'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  console.log('🔥 session in student layout:', session)

  // If no valid student session, kick to home
  if (!session?.user?.role || session.user.role !== 'student') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
