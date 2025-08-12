// src/app/dashboard/admin/students/[id]/edit/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth' // or 'next-auth/next' depending on your setup
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditStudentForm from '@/components/forms/EditStudentForm'

export default async function EditStudentPage({
  params,
}: {
  params: { id: string }             // ← plain object, NOT a Promise
}) {
  // 1) Protect route: only admins
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return redirect('/auth/login')
  }

  // 2) Read id and validate
  const studentId = Number(params.id)
  if (Number.isNaN(studentId)) {
    return redirect('/dashboard/admin/students')
  }

  // 3) Load student
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })

  if (!student) {
    return redirect('/dashboard/admin/students')
  }

  // 4) Render edit form (EditStudentForm should be a client component)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Student</h1>
      <EditStudentForm
        initialData={{
          ...student,
          // If sessionYear in DB is stored as string, convert to number:
          sessionYear: Number(student.sessionYear),
        }}
      />
    </div>
  )
}
