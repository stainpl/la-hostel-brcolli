import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StudentDashboardWrapper from './StudentDashboardWrapper'
import { Bug } from 'lucide-react'
import Image from 'next/image' 

export default async function StudentPage() {
  // 1) Protect route
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    redirect('/')
  }

  // 2) Load student with room & payment status
  const student = await prisma.student.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      fullName:    true,
      regNo:       true,
      phone:       true,
      email:       true,
      state:       true,
      lga:         true,
      gender:      true,
      sponsorName: true,
      sponsorPhone:true,
      sessionYear: true,
      profilePhoto:true,
      hasPaid:     true,
      room: {
        select: {
          block: true,
          number: true,
        },
      },
    },
  })

  if (!student) {
    redirect('/')
  }

  // Extract first name for welcome (safer fallback)
  const firstName = (student.fullName ?? '').split(' ')[0] || 'Student'

  return (
    <StudentDashboardWrapper>
      <div className="min-h-screen bg-gray-700">
        <main className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Welcome Header */}
          <header className="text-white">
            <h1 className="text-2xl font-bold">Welcome, {firstName}!</h1>
          </header>

          {/* Collapsible Profile Card */}
          <details className="bg-gray-500 rounded-2xl shadow p-4">
            <summary className="cursor-pointer font-semibold text-white">
              View Profile
            </summary>
            <div className="mt-4 flex flex-col md:flex-row md:space-x-6">
              {/* Profile photo */}
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <Image
                  src={student.profilePhoto ?? '/avatar-placeholder.png'} // removed spaces
                  alt={`${student.fullName} profile`}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              </div>
              {/* Profile details grid */}
              <div className="flex-1 grid grid-cols-2 gap-y-2 text-white">
                <div className="font-semibold">Full Name:</div>
                <div>{student.fullName}</div>
                <div className="font-semibold">Reg No:</div>
                <div>{student.regNo}</div>
                <div className="font-semibold">Email:</div>
                <div className="break-words">{student.email}</div>
                <div className="font-semibold">Phone:</div>
                <div>{student.phone}</div>
                <div className="font-semibold">State / LGA:</div>
                <div>{student.state} / {student.lga}</div>
                <div className="font-semibold">Gender:</div>
                <div>{student.gender}</div>
                <div className="font-semibold">Sponsor:</div>
                <div>{student.sponsorName} ({student.sponsorPhone})</div>
                <div className="font-semibold">Session Year:</div>
                <div>{student.sessionYear}</div>
                <div className="font-semibold">Room:</div>
                <div>{student.room ? `${student.room.block}-${student.room.number}` : 'Not assigned'}</div>
                <div className="font-semibold">Payment:</div>
                <div>
                  {student.room ? (
                    student.hasPaid ? (
                      <span className="text-green-400 font-semibold">Confirmed ✅</span>
                    ) : (
                      <span className="text-yellow-300 font-semibold">Pending ⏳</span>
                    )
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </details>

          {/* Action cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/dashboard/student/tickets" className="block">
              <div className="bg-blue-500 rounded-2xl shadow hover:shadow-lg transition p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Tickets</h3>
                <p className="text-sm text-gray-200">View or open support tickets</p>
              </div>
            </Link>

            <Link href="/dashboard/student/room-request" className="block">
              <div className="bg-blue-500 rounded-2xl shadow hover:shadow-lg transition p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Request Room</h3>
                <p className="text-sm text-gray-200">Apply for available rooms</p>
              </div>
            </Link>

            <Link href="/dashboard/student/payments" className="block">
              <div className="bg-blue-500 rounded-2xl shadow hover:shadow-lg transition p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Payments</h3>
                <p className="text-sm text-gray-200">View payments</p>
              </div>
            </Link>
          </section>

          {/* Report Bug */}
          <div className="flex justify-center">
            <a
              href="mailto:alagablogger@gmail.com?subject=Bug%20Report"
              className="inline-flex items-center mt-4 text-red-400 hover:text-red-200"
            >
              <Bug className="mr-2 h-5 w-5" />
              Report a Bug
            </a>
          </div>
        </main>
      </div>
    </StudentDashboardWrapper>
  )
}
