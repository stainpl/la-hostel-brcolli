// src/app/dashboard/admin/tickets/TicketsAdminClient.tsx
'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

export type TicketAdmin = {
  id:        number
  subject:   string
  status:    'OPEN' | 'CLOSED'
  createdAt: Date
  student:   string
  gender:    'MALE' | 'FEMALE'
}

interface Props {
  openTickets:       TicketAdmin[]
  closedTickets:     TicketAdmin[]
  openPage:          number
  closedPage:        number
  totalOpenPages:    number
  totalClosedPages:  number
  currentGender:     'MALE' | 'FEMALE' | 'ALL'
}

export default function TicketsAdminClient({
  openTickets,
  closedTickets,
  openPage,
  closedPage,
  totalOpenPages,
  totalClosedPages,
  currentGender,
}: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // local filter state
  const [genderFilter, setGenderFilter] = useState(currentGender)

  // apply gender filter (resets both pages to 1)
  const applyFilter = () => {
    const params = new URLSearchParams()
    params.set('openPage',  '1')
    params.set('closedPage','1')
    if (genderFilter !== 'ALL') params.set('gender', genderFilter)
    router.push(`/dashboard/admin/tickets?${params.toString()}`)
  }

  // page navigation handlers
  const goToOpenPage = (p: number) => {
    const params = new URLSearchParams(searchParams as any)
    params.set('openPage', String(p))
    router.push(`/dashboard/admin/tickets?${params.toString()}`)
  }
  const goToClosedPage = (p: number) => {
    const params = new URLSearchParams(searchParams as any)
    params.set('closedPage', String(p))
    router.push(`/dashboard/admin/tickets?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="font-medium text-gray-900">Gender Filter:</label>
        <select
          value={genderFilter}
          onChange={e => setGenderFilter(e.target.value as any)}
          className="input w-40"
        >
          <option value="ALL">All</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <button onClick={applyFilter} className="btn-secondary">
          Apply
        </button>
      </div>

      {/* Two‑column tables */}
      <div className="grid grid-cols-2 gap-6">
        {/* OPEN */}
        <div>
          <h2 className="font-semibold mb-2 text-gray-800">Open Tickets</h2>
          <div className="overflow-x-auto bg-white rounded shadow mb-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2">&nbsp;</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {openTickets.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-2 text-sm text-green-600">{t.student}</td>
                    <td className="px-4 py-2 text-sm text-gray-950">{t.subject}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/dashboard/admin/tickets/${t.id}`}
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        View & Reply
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Open pagination */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToOpenPage(openPage - 1)}
              disabled={openPage === 1}
              className="btn-secondary text-sm"
            >
              ← Prev
            </button>
            <span>Page {openPage}/{totalOpenPages}</span>
            <button
              onClick={() => goToOpenPage(openPage + 1)}
              disabled={openPage === totalOpenPages}
              className="btn-secondary text-sm"
            >
              Next →
            </button>
          </div>
        </div>

        {/* CLOSED */}
        <div>
          <h2 className="font-semibold mb-2 text-amber-950">Closed Tickets</h2>
          <div className="overflow-x-auto bg-white rounded shadow mb-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2">&nbsp;</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {closedTickets.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-2 text-sm text-green-600">{t.student}</td>
                    <td className="px-4 py-2 text-sm text-pink-700">{t.subject}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/dashboard/admin/tickets/${t.id}`}
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Closed pagination */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToClosedPage(closedPage - 1)}
              disabled={closedPage === 1}
              className="btn-secondary text-sm"
            >
              ← Prev
            </button>
            <span>Page {closedPage}/{totalClosedPages}</span>
            <button
              onClick={() => goToClosedPage(closedPage + 1)}
              disabled={closedPage === totalClosedPages}
              className="btn-secondary text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
