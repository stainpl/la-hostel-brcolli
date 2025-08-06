// src/components/ui/use-toast.ts
import { Toaster, toast as hotToast } from 'react-hot-toast'
import React from 'react'


export function useToast() {
  const toast = React.useCallback(
    ({ title, description }: { title: string; description?: string }) => {
      const message = description ? `${title}: ${description}` : title
      hotToast.success(message)
    },
    []
  )
  return { toast }
}

export function ToastProvider() {
  return <Toaster position="top-right" />
}