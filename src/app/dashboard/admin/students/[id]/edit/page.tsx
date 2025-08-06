// src/app/dashboard/admin/students/[id]/edit/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditStudentForm from '@/components/forms/EditStudentForm'

export default async function EditStudentPage(props: any) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    redirect('/auth/login')
  }
  
  const { params } = await props
  const studentId = Number(params.id)
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) {
    redirect('/dashboard/admin/students')
  }

  return (
    <div>
      {/* … your header … */}
      <EditStudentForm initialData={{ ...student, sessionYear: Number(student.sessionYear) }} />

    </div>
  )
}
