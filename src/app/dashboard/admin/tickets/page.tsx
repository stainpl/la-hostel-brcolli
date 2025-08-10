// src/app/dashboard/admin/tickets/page.tsx
import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TicketsAdminClient from './TicketsAdminClient'
import type { Prisma } from '@prisma/client'

interface SearchParams {
  openPage?: string
  closedPage?: string
  gender?: string
}

export default async function AdminTicketsPage({ searchParams }: { searchParams: SearchParams }) {
  // 1) Auth guard
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  // 2) Read paging + filter params (guard NaN -> 1)
  const rawOpen = parseInt(searchParams.openPage || '1', 10)
  const rawClosed = parseInt(searchParams.closedPage || '1', 10)
  const openPage = Number.isNaN(rawOpen) ? 1 : rawOpen
  const closedPage = Number.isNaN(rawClosed) ? 1 : rawClosed

  const gender = searchParams.gender?.toUpperCase()
  const take = 10
  const skipOpen = (openPage - 1) * take
  const skipClosed = (closedPage - 1) * take

  // 3) Build gender filter if any
  const genderClause: Prisma.TicketWhereInput =
    gender === 'MALE' ? { student: { gender: 'MALE' } } :
    gender === 'FEMALE' ? { student: { gender: 'FEMALE' } } :
    {}

  // 4) Fetch open & closed separately (include student relation)
  const [openTicketsRaw, totalOpen, closedTicketsRaw, totalClosed] = await prisma.$transaction([
    prisma.ticket.findMany({
      where: { status: 'OPEN', ...genderClause },
      orderBy: { createdAt: 'desc' },
      skip: skipOpen,
      take,
      include: { student: { select: { fullName: true, gender: true } } },
    }),
    prisma.ticket.count({ where: { status: 'OPEN', ...genderClause } }),
    prisma.ticket.findMany({
      where: { status: 'CLOSED', ...genderClause },
      orderBy: { createdAt: 'desc' },
      skip: skipClosed,
      take,
      include: { student: { select: { fullName: true, gender: true } } },
    }),
    prisma.ticket.count({ where: { status: 'CLOSED', ...genderClause } }),
  ])

  const totalOpenPages = Math.max(1, Math.ceil(totalOpen / take))
  const totalClosedPages = Math.max(1, Math.ceil(totalClosed / take))

  // 5) Map to client shape (convert createdAt -> string)
  const mapTicket = (t: (typeof openTicketsRaw)[number]) => ({
    id: t.id,
    subject: t.subject,
    status: t.status as 'OPEN' | 'CLOSED',
    // convert Date -> ISO string so client side can render reliably
    createdAt: (t.createdAt instanceof Date) ? t.createdAt.toISOString() : String(t.createdAt),
    student: t.student?.fullName ?? 'Unknown',
    gender: (t.student?.gender as 'MALE' | 'FEMALE') ?? 'MALE',
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Manage Support Tickets</h1>
          <Link href="/dashboard/admin" className="text-indigo-600 hover:underline text-sm">
            ← Dashboard Home
          </Link>
        </header>

        <TicketsAdminClient
          openTickets={openTicketsRaw.map(mapTicket)}
          closedTickets={closedTicketsRaw.map(mapTicket)}
          openPage={openPage}
          closedPage={closedPage}
          totalOpenPages={totalOpenPages}
          totalClosedPages={totalClosedPages}
          currentGender={(gender as 'MALE' | 'FEMALE') || 'ALL'}
        />
      </main>
    </div>
  )
}
