// src/app/dashboard/admin/students/[id]/page.tsx
import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditStudentForm from '@/components/forms/EditStudentForm'

interface Props {
  params: { id: string }
}

export default async function EditStudentPage({ params }: Props) {
  // 1) Auth guard
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  const studentId = Number(params.id)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      fullName: true,
      regNo: true,
      phone: true,
      email: true,
      state: true,
      lga: true,
      gender: true,
      sponsorName: true,
      sponsorPhone: true,
      sessionYear: true,
      roomId: true,
      hasPaid: true,
    },
  })

  if (!student) {
    redirect('/dashboard/admin/students')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Student</h1>
          <Link
            href="/dashboard/admin/students"
            className="text-indigo-600 hover:underline text-sm"
          >
            ← Back to List
          </Link>
        </header>

        {/* Pass the student as initial values */}
        <EditStudentForm initialData={student} />
      </main>
    </div>
  )
}
