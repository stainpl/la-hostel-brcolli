// src/app/payment/page.tsx
import PaymentClient from '@/components/PaymentClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { redirect } from 'next/navigation'

export default async function PaymentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'student') {
    redirect('/')  // protect it
  }

  // session.user.id is the stringified Prisma ID
  const studentId = session.user.id!

  return (
    <PaymentClient studentId={studentId} />
  )
}
