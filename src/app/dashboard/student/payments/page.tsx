// src/app/dashboard/student/payments/page.tsx
import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

type Payment = {
  id:        number
  reference: string
  amount:    number
  status:    string
  createdAt: Date
}

export default async function PaymentsPage() {
  // 1) Protect route
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    redirect('/')
  }
  const studentId = Number(session.user.id)

  // 2) Fetch only SUCCESSFUL payments
  const payments: Payment[] = await prisma.payment.findMany({
  where: { studentId, status: { in: ['success', 'confirmed'] } },
  orderBy: { createdAt: 'desc' },
  select: { id: true, reference: true, amount: true, status: true, createdAt: true },
})



  return (
    <div className="min-h-screen bg-gray-700">
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header with Back link */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Payments</h1>
          <Link
            href="/dashboard/student"
            className="text-indigo-300 hover:text-indigo-100"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {payments.length === 0 ? (
          <p className="text-gray-200">
            You haven&apos;t made any payments yet. Payments you make will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount (₦)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {p.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                       ₦{(p.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2,
  })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
