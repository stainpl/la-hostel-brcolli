// src/app/dashboard/admin/students/[id]/page.tsx
import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditStudentForm from '@/components/forms/EditStudentForm'


export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  if (!params?.id) {
    redirect('/dashboard/admin/students')
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

        <EditStudentForm initialData={{ ...student, sessionYear: Number(student.sessionYear) }} />
      </main>
    </div>
  )
}
