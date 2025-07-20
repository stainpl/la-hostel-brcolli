// src/components/Providers.tsx
'use client'

import React, { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-right" reverseOrder={false} />
      {children}
    </SessionProvider>
  )
}
