// src/app/dashboard/student/room-request/page.tsx
import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import RoomRequestForm from '@/components/forms/RoomRequestForm'

type Room = {
  id:     number
  block:  string
  number: number
  price:  number
}

export default async function RoomRequestPage() {
  // 1) Guard: only students
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    redirect('/')     // no return needed
  }
  const studentId = Number(session.user.id)

  // 2) Load student
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { gender: true, fullName: true, hasPaid: true },
  })
  if (!student) {
    redirect('/')
  }

  // 3) Prevent re‑paying
  if (student.hasPaid) {
    redirect('/dashboard/student?error=already_paid')
  }

  // 4) Fetch available rooms for the student’s gender
  const rooms = await prisma.room.findMany({
    where: { isFilled: false, gender: student.gender },
    orderBy: [{ block: 'asc' }, { number: 'asc' }],
    select: { id: true, block: true, number: true, price: true },
  })

  const options = rooms.map((r: Room) => ({
    id:    r.id,
    label: `${r.block} ${r.number}`,
    price: r.price,
  }))

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-400">Request a Room</h1>
        <Link
          href="/dashboard/student"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </header>

      <p className="text-gray-700">
        Hello, <span className="font-semibold">{student.fullName}</span>. Showing only {student.gender} rooms.
      </p>

      {options.length === 0 ? (
        <p className="text-red-500">No {student.gender} rooms available right now.</p>
      ) : (
        // Pass the numeric studentId, not student.id()
        <RoomRequestForm options={options} studentId={studentId} />
      )}
    </div>
  )
}
