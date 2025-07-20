// src/components/ui/Spinner.tsx
'use client'

export default function Spinner({
  size = 24,
  colorClass = 'text-white',
}: {
  size?: number        // in pixels
  colorClass?: string   // a static tailwind color class, e.g. 'text-white' or 'text-gray-500'
}) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={`animate-spin inline-block border-2 border-t-2 border-transparent border-t-current ${colorClass} rounded-full`}
      style={{ width: size, height: size }}
    />
  )
}
