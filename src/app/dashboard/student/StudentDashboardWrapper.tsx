'use client'
import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function StudentDashboardWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const error        = searchParams?.get('error') ?? null

  useEffect(() => {
    if (error === 'already_paid') {
      toast.error('You have already paid for this session year.')
      // remove the query param so it won’t show again
      router.replace('/dashboard/student', { scroll: false })
    }
  }, [error, router])

  return <>{children}</>
}
