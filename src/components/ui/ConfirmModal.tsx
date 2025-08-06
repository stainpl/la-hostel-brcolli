// src/components/ui/ConfirmModal.tsx
'use client'


import React from 'react'
import Button from '@/components/ui/button'

export interface ConfirmModalProps {
  isOpen: boolean
  title?: React.ReactNode
  description: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  disabledConfirm?: boolean
}

export default function ConfirmModal({
  isOpen,
  title = 'Please confirm',
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  disabledConfirm = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* modal panel */}
      <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-md w-full">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="text-sm text-gray-700 mb-6">{description}</div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={disabledConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}