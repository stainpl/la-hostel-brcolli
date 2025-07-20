import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StudentsAdminClient from './StudentAdminClient'

// Define the type for a student row as returned from Prisma
type StudentRow = {
  id: number
  fullName: string
  email: string
  room: { block: string; number: string } | null
  gender: 'MALE' | 'FEMALE'
  sessionYear: number
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined> // explicitly type searchParams
}) {
  // Await searchParams per Next.js requirement
  const params = await searchParams as Record<string, string | undefined>

  // 1) Auth guard
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  // 2) Read filters & pagination
  const pageParam  = params.page  || '1'
  const gender     = params.gender ? params.gender.toUpperCase() : undefined
  const yearParam  = params.year   || ''
  const page       = parseInt(pageParam, 10) || 1
  const take       = 10
  const skip       = (page - 1) * take

  // 3) Build where clause
  const where: Record<string, any> = {}
  if (gender === 'MALE' || gender === 'FEMALE') where.gender = gender
  if (yearParam.match(/^\d{4}$/)) where.sessionYear = Number(yearParam)

  // 4) Fetch data + count
  const [students, total]: [StudentRow[], number] = await prisma.$transaction([
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
  ])

  const totalPages = Math.ceil(total / take)

  // 5) Map for client
  const data = students.map((s: StudentRow) => ({
    id: s.id,
    fullName: s.fullName,
    email: s.email,
    room: s.room ? `${s.room.block}-${s.room.number}` : '—',
    gender: s.gender,
    sessionYear: s.sessionYear,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Student Records</h1>
          <Link href="/dashboard/admin" className="text-indigo-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </header>

        <StudentsAdminClient
          students={data}
          page={page}
          totalPages={totalPages}
          currentGender={(gender as 'MALE' | 'FEMALE') || 'ALL'}
          currentYear={yearParam}
        />
      </main>
    </div>
  )
}