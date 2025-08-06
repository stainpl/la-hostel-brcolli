'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/button'
import ConfirmModal from '@/components/ui/ConfirmModal'

function shortenEmail(email: string) {
  const [local, domain] = email.split('@')
  const shortLocal  = local.length  > 5 ? `${local.slice(0,3)}…` : local
  const shortDomain = domain.length > 5 ? `…${domain.slice(-4)}` : domain
  return `${shortLocal}@${shortDomain}`
}

interface StudentWithPaymentStatus {
  id:           number
  fullName:     string
  email:        string
  sessionYear:  string
  hasPaid:      boolean
  room: {
    block:  string | number
    number: number
  } | null
}

interface PaymentWithRelations {
  id:        number
  reference: string
  amount:    number
  status:    string
  method:    string | null
  createdAt: string
  student: {
    fullName:    string
    email:       string
    sessionYear: string
    room: {
      block:  string
      number: number
    } | null
  }
  admin: {
    email: string
  } | null
}

export default function AdminPaymentsPage() {
  const [query,       setQuery]       = useState('')
  const [student,     setStudent]     = useState<StudentWithPaymentStatus | null>(null)
  const [payments,    setPayments]    = useState<PaymentWithRelations[]>([])
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [isMarking,   setIsMarking]   = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [pendingStudent, setPendingStudent] = useState<StudentWithPaymentStatus | null>(null)
  const [toastMsg,       setToastMsg]       = useState<string | null>(null)

  // 1) Fetch recent payments whenever `page` changes
  useEffect(() => {
    fetch(`/api/admin/payments?page=${page}`)
      .then(r => r.json())
      .then(data => {
        setPayments(data.payments)
        setTotalPages(data.totalPages ?? 1)
      })
      .catch(() => {
        setPayments([])
        setTotalPages(1)
      })
  }, [page])

  // 2) Search a student by query (ignores pagination)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setStudent(null)
    try {
      const res = await fetch(`/api/admin/payments?q=${encodeURIComponent(query)}`)
      const json = await res.json()
      setStudent(json.student)
    } catch {
      // ignore
    } finally {
      setIsSearching(false)
    }
  }

  // 3) Mark paid flow
  const onMarkPaidClick = () => {
    if (student) {
      setPendingStudent(student)
      setShowConfirm(true)
    }
  }

  const confirmMarkPaid = async () => {
    if (!pendingStudent) return
    setShowConfirm(false)
    setIsMarking(true)
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: pendingStudent.id }),
      })
      if (res.ok) {
        setToastMsg('Payment marked successfully')
        // Refresh student card
        const updated = await fetch(`/api/admin/payments?q=${encodeURIComponent(pendingStudent.fullName)}`)
        const { student: newStudent } = await updated.json()
        setStudent(newStudent)
        // Refresh payments list and reset to first page
        setPage(1)
      } else {
        setToastMsg('Failed to mark payment')
      }
    } catch {
      setToastMsg('Unexpected error')
    } finally {
      setIsMarking(false)
      setPendingStudent(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, email or RegNo"
          className="input flex-1 text-gray-900 placeholder-gray-400 placeholder-opacity-75 placeholder:text-lg focus:placeholder-transparent"
        />
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {/* Toast */}
      {toastMsg && (
        <div className="bg-green-100 text-green-800 p-3 rounded">
          {toastMsg}
        </div>
      )}

      {/* Student Card */}
      {student && (
        <div className="bg-white p-4 rounded shadow space-y-2 text-black">
          <h2 className="font-semibold">
            {student.fullName} ({student.email})
          </h2>
          {student.room ? (
            <p>Room: {student.room.block}-{student.room.number}</p>
          ) : (
            <p>No room assigned yet</p>
          )}
          <p>Session: {student.sessionYear}</p>
          <p>
            Status:{' '}
            {student.hasPaid ? (
              <span className="text-green-600 font-semibold">Paid ✅</span>
            ) : (
              <Button onClick={() => {
            if (student.hasPaid) {
      console.log('Student is already paid');
      return;
    }
    // otherwise mark them as paid
    onMarkPaidClick(); }} variant={student.hasPaid ? 'secondary' : 'primary'}
        disabled={isMarking}
>
       {student.hasPaid? 'Paid ✅'
    : isMarking? 'Processing…' : 'Mark Paid'}
         </Button>
            )}
          </p>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          title="Confirm Mark Paid"
          description={`Are you sure you want to mark payment for ${pendingStudent?.fullName}?`}
          onConfirm={confirmMarkPaid}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Recent Payments */}
      <h3 className="text-xl font-semibold text-gray-600">Recent Payments</h3>
      <div className="space-y-4">
        {payments.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow text-gray-800">
            <p>
              <strong>{p.student.fullName}</strong> — {p.reference} — ₦{(p.amount/100).toLocaleString()} —{' '}
              <em>{new Date(p.createdAt).toLocaleDateString()}</em> —{' '}
              {p.admin ? `By ${shortenEmail(p.admin.email)}` : 'Via Paystack'}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !query && (
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </Button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  )
}