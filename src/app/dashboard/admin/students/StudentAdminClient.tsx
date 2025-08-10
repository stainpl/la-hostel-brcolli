// src/app/dashboard/admin/students/StudentsAdminClient.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import Button from '@/components/ui/button'
import ConfirmModal from '@/components/ui/ConfirmModal'

export type StudentAdmin = {
  id: number
  fullName: string
  email: string
  room: string
  gender: 'MALE' | 'FEMALE'
  sessionYear: number
}

type GenderFilter = 'MALE' | 'FEMALE' | 'ALL'

interface Props {
  students: StudentAdmin[]
  page: number
  totalPages: number
  currentGender: GenderFilter
  currentYear: string
}

export default function StudentsAdminClient({
  students,
  page,
  totalPages,
  currentGender,
  currentYear
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Filters state
  const [genderFilter, setGenderFilter] = useState<GenderFilter>(currentGender)
  const [yearFilter, setYearFilter] = useState(currentYear)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [actionInfo, setActionInfo] = useState<{ id: number; type: 'clear' | 'delete' } | null>(
    null
  )

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('page', '1')
      if (genderFilter !== 'ALL') params.set('gender', genderFilter)
      if (yearFilter) params.set('year', yearFilter)
      router.push(`/dashboard/admin/students?${params.toString()}`)
    })
  }

  const goToPage = (p: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(p))
      router.push(`/dashboard/admin/students?${params.toString()}`)
    })
  }

  const onActionClick = (id: number, type: 'clear' | 'delete') => {
    setActionInfo({ id, type })
    setModalOpen(true)
  }

  const onConfirm = async () => {
    if (!actionInfo) return
    const { id, type } = actionInfo
    setModalOpen(false)
    setActionInfo(null)
    try {
      await axios.patch(`/api/admin/students/${id}/${type}`)
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const onCancel = () => {
    setModalOpen(false)
    setActionInfo(null)
  }

  return (
    <>
      <ConfirmModal
        isOpen={modalOpen}
        title="Confirm Action"
        description={`Are you sure you want to ${actionInfo?.type} this student?`}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value as GenderFilter)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-400 bg-white placeholder:text-gray-600 focus:outline-none focus:ring 
             dark:bg-gray-800 dark:text-white dark:border-gray-600"
        >
          <option value="ALL">All Genders</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <input
          type="text"
          placeholder="Session Year (e.g. 2025)"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="input w-36"
        />
        <Button variant="secondary" size="sm" onClick={applyFilters} disabled={isPending}>
          {isPending ? 'Loading…' : 'Filter'}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Room', 'Gender', 'Year', 'Actions'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-xs font-medium text-gray-500 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{s.fullName}</td>
                <td className="px-4 py-2 text-sm text-green-900">{s.email}</td>
                <td className="px-4 py-2 text-sm text-blue-900">{s.room}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{s.gender}</td>
                <td className="px-4 py-2 text-sm text-green-700">{s.sessionYear}</td>
                <td className="px-4 py-2 text-sm flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/admin/students/${s.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onActionClick(s.id, 'clear')}>
                    Clear Room
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onActionClick(s.id, 'delete')}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1 || isPending}
          >
            ← Prev
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages || isPending}
          >
            Next →
          </Button>
        </div>
      )}
    </>
  )
}
