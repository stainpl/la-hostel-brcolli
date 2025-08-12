import React from 'react'
import { getServerSession } from 'next-auth' 
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditStudentForm from '@/components/forms/EditStudentForm'

export default async function EditStudentPage({
  params,
}: {
  params: { id: string }          
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return redirect('/auth/login')
  }

  const studentId = Number(params.id)
  if (Number.isNaN(studentId)) {
    return redirect('/dashboard/admin/students')
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })

  if (!student) {
    return redirect('/dashboard/admin/students')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Student</h1>
      <EditStudentForm
        initialData={{
          ...student,
          sessionYear: Number(student.sessionYear),
        }}
      />
    </div>
  )
}
