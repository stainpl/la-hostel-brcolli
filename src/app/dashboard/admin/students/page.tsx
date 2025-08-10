// app/dashboard/admin/students/page.tsx
import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StudentAdminClient from './StudentAdminClient'

type RawStudent = {
  id: number
  fullName: string
  email: string
  room: { block: string; number: number } | null
  gender: 'MALE' | 'FEMALE'
  sessionYear: string
}

export type StudentAdmin = {
  id: number
  fullName: string
  email: string
  room: string
  gender: 'MALE' | 'FEMALE'
  sessionYear: number
}

interface AdminStudentsPageProps {
  searchParams: Record<string, string | undefined>
}

export default async function AdminStudentsPage({ searchParams }: AdminStudentsPageProps) {
  // 1) Auth guard
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    redirect('/auth/login')
  }

  // 2) Filters & pagination
  const pageParam = searchParams.page ?? '1'
  const genderParam = searchParams.gender?.toUpperCase()
  const yearParam = searchParams.year ?? ''
  const page = parseInt(pageParam, 10) || 1
  const take = 10
  const skip = (page - 1) * take

  // 3) Prisma where clause
  const where: Record<string, any> = {}
  if (genderParam === 'MALE' || genderParam === 'FEMALE') {
    where.gender = genderParam
  }
  if (/^\d{4}$/.test(yearParam)) {
    where.sessionYear = yearParam
  }

  // 4) Fetch
  const [rawRows, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        fullName: true,
        email: true,
        room: { select: { block: true, number: true } },
        gender: true,
        sessionYear: true,
      },
    }),
    prisma.student.count({ where }),
  ]) as [RawStudent[], number]

  const totalPages = Math.ceil(total / take)

  // 5) Map to client shape
  const students: StudentAdmin[] = rawRows.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    email: s.email,
    room: s.room ? `${s.room.block}-${s.room.number}` : '—',
    gender: s.gender,
    sessionYear: parseInt(s.sessionYear, 10),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-950">Student Records</h1>
          <Link
            href="/dashboard/admin"
            className="text-indigo-600 hover:underline text-sm"
          >
            ← Back to Dashboard
          </Link>
        </header>

        <StudentsAdminClient
          students={students}
          page={page}
          totalPages={totalPages}
          currentGender={
            genderParam === 'MALE' || genderParam === 'FEMALE' ? genderParam : 'ALL'
          }
          currentYear={yearParam}
        />
      </main>
    </div>
  )
}
