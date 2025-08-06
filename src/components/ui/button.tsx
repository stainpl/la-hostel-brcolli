// src/components/ui/button.tsx
'use client'

import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

// 1) Extend the Variant type to include 'destructive'
type Variant = 'primary' | 'secondary' | 'outline' | 'destructive'

type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition'

  // Size modifiers
  const sizes: Record<Size, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
  }

  // Variant styles, now including 'destructive'
  const variants: Record<Variant, string> = {
    primary:   'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    outline:   'border border-gray-300 text-gray-800 hover:bg-gray-50 focus:ring-gray-400',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }

  return (
    <button
      className={clsx(
        base,
        sizes[size],
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
