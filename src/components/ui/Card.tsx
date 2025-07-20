// components/ui/Card.tsx
import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-transform hover:scale-[1.02] hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  )
}
