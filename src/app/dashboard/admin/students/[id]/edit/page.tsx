import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditStudentForm from '@/components/forms/EditStudentForm'

export default async function EditStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'admin') {
    redirect('/auth/login')
  }

  const resolvedParams = await params
  const studentId = Number(resolvedParams.id)

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
      <h1>Edit Student</h1>
      <EditStudentForm
        initialData={{ 
          ...student, 
          sessionYear: Number(student.sessionYear),
        }}
      />
    </div>
  )
}
