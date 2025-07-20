// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import Script from 'next/script'

export const metadata: Metadata = {
  title:       'My_Hostel',
  description: 'Built by @stainpl',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Paystack inline JS must load beforeInteractive */}
        <Script
          src="https://js.paystack.co/v2/inline.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {/* Everything under Providers can use hooks & context */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
