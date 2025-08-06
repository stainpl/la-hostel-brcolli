// src/app/dashboard/admin/rooms/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/pages/api/auth/[...nextauth]'
import { redirect }         from 'next/navigation'
import { prisma }           from '@/lib/prisma'
import RoomsAdminClient, { RoomWithCounts } from '@/app/dashboard/admin/rooms/RoomAdminClient'
import type { Room, Student } from '@prisma/client'

// Extend the Prisma Room with only the bits we need on Student:
type RawRoom = Room & {
  students: Array<Pick<Student, 'hasPaid'>>
}

export default async function AdminRoomsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  // Fetch raw rooms including only each student’s hasPaid flag
  const rooms = (await prisma.room.findMany({
    include: {
      students: { select: { hasPaid: true } },
    },
    orderBy: [
      { block: 'asc' },
      { number: 'asc' },
    ],
  })) as RawRoom[]

  // Map into the client-shape, with explicit return typing
  const data: RoomWithCounts[] = rooms.map((r): RoomWithCounts => {
    const total = r.students.length
    const paid  = r.students.filter((s) => s.hasPaid).length

    return {
      id:            r.id,
      label:         `${r.block}-${r.number}`,
      block:         r.block,
      number:        r.number,
      price:         r.price,
      gender:        r.gender as 'MALE' | 'FEMALE',
      totalStudents: total,
      paidCount:     paid,
     students:      r.students,
    }
  })

  return <RoomsAdminClient rooms={data} />
}
