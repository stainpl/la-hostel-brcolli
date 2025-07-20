// src/app/dashboard/admin/students/StudentsAdminClient.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

export type StudentAdmin = {
  id:          number
  fullName:    string
  email:       string
  room:        string
  gender:      'MALE' | 'FEMALE'
  sessionYear: number
}

interface Props {
  students:      StudentAdmin[]
  page:          number
  totalPages:    number
  currentGender: 'MALE' | 'FEMALE' | 'ALL'
  currentYear:   string
}

export default function StudentsAdminClient({
  students,
  page,
  totalPages,
  currentGender,
  currentYear,
}: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local filter state
  const [genderFilter, setGenderFilter] = useState(currentGender)
  const [yearFilter, setYearFilter]     = useState(currentYear)

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('page', '1')
      if (genderFilter !== 'ALL') params.set('gender', genderFilter)
      if (yearFilter)             params.set('year', yearFilter)
      router.push(`/dashboard/admin/students?${params.toString()}`)
    })
  }

  const goToPage = (p: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams as any)
      params.set('page', String(p))
      router.push(`/dashboard/admin/students?${params.toString()}`)
    })
  }

  const handleAction = async (id: number, action: 'clear' | 'delete') => {
    if (!confirm(`Are you sure you want to ${action} this student?`)) return
    await axios.patch(`/api/admin/students/${id}/${action}`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={genderFilter}
          onChange={e => setGenderFilter(e.target.value as any)}
          className="input w-40"
        >
          <option value="ALL">All Genders</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <input
          type="text"
          placeholder="Session Year (e.g. 2025)"
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="input w-36"
        />
        <button
          onClick={applyFilters}
          className="btn-secondary flex items-center"
          disabled={isPending}
        >
          {isPending ? 'Loading…' : 'Filter'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name','Email','Room','Gender','Year','Actions'].map(h => (
                <th key={h} className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(s => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-sm">{s.fullName}</td>
                <td className="px-4 py-2 text-sm">{s.email}</td>
                <td className="px-4 py-2 text-sm">{s.room}</td>
                <td className="px-4 py-2 text-sm">{s.gender}</td>
                <td className="px-4 py-2 text-sm">{s.sessionYear}</td>
                <td className="px-4 py-2 text-sm space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/admin/students/${s.id}/edit`)}
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleAction(s.id, 'clear')}
                    className="text-yellow-600 hover:underline text-sm"
                  >
                    Clear Room
                  </button>
                  <button
                    onClick={() => handleAction(s.id, 'delete')}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1 || isPending}
            className="btn-secondary text-sm"
          >
            ← Prev
          </button>
          <span>Page {page}/{totalPages}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages || isPending}
            className="btn-secondary text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
