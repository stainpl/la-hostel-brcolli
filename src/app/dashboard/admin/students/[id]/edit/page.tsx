import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditStudentForm from '@/components/forms/EditStudentForm'

export default async function EditStudentPage({ params }: any) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'admin') {
    redirect('/auth/login')
  }

  // Normalize params.id in case it's an array
  const idValue = Array.isArray(params.id) ? params.id[0] : params.id
  const studentId = Number(idValue)

  if (Number.isNaN(studentId)) {
    redirect('/dashboard/admin/students')
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })

  if (!student) {
    redirect('/dashboard/admin/students')
  }

  return (
    <div>
      {/* Example heading */}
      <h1 className="text-2xl font-bold mb-4">Edit Student</h1>

      <EditStudentForm
        initialData={{
          ...student,
          sessionYear: Number(student.sessionYear),
        }}
      />
    </div>
  )
}