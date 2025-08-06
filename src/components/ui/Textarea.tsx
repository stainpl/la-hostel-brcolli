
'use client'

import React, { TextareaHTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** e.g. "placeholder:text-gray-400" */
  placeholderClassName?: string
  className?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ placeholderClassName, className, ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={twMerge(
        'border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
        // default placeholder styling using the Tailwind v3+ syntax:
        'placeholder:text-gray-400',
        // allow override via prop:
        placeholderClassName,
        // custom classes passed in:
        className
      )}
    />
  )
)

Textarea.displayName = 'Textarea'
export default Textarea
