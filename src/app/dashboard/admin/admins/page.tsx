// src/app/dashboard/admin/admins/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Button from '@/components/ui/button'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/use-toast'

type Admin = {
  id: number
  nickname: string
  email: string
  createdAt: string
}

export default function ManageAdminsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [admins, setAdmins] = useState<Admin[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteNickname, setInviteNickname] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For confirmations
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: 'delete' | 'reset'; id: number } | null>(null)

  // Fetch the list (memoized to satisfy hooks lint rules)
  const loadAdmins = useCallback(async () => {
    try {
      const { data } = await axios.get<Admin[]>('/api/admin/admins')
      setAdmins(data)
    } catch (err: unknown) {
      // Don't show a blocking error; log and show toast
      let msg = 'Failed to load admins.'
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? err.message ?? msg
      } else if (err instanceof Error) {
        msg = err.message
      }
      console.error('[loadAdmins]', msg)
      toast({ title: 'Load failed', description: msg })
    }
  }, [toast])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  // Invite new admin
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!inviteNickname.trim() || !inviteEmail.trim()) {
      setError('Both nickname and email are required.')
      return
    }
    setInviting(true)
    try {
      await axios.post('/api/admin/admins/invite', {
        nickname: inviteNickname.trim(),
        email: inviteEmail.trim(),
      })
      setInviteNickname('')
      setInviteEmail('')
      await loadAdmins()
      toast({ title: 'Invite sent', description: 'An invitation email has been sent.' })
    } catch (err: unknown) {
      let message = 'Failed to send invite.'
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? err.message ?? message
      } else if (err instanceof Error) {
        message = err.message
      }
      setError(message)
    } finally {
      setInviting(false)
    }
  }

  // kick off delete or reset flows
  const confirmAction = (type: 'delete' | 'reset', id: number) => {
    setPendingAction({ type, id })
    setModalOpen(true)
  }

  const runAction = async () => {
    if (!pendingAction) return
    const { type, id } = pendingAction
    setModalOpen(false)
    try {
      if (type === 'delete') {
        await axios.delete(`/api/admin/admins/${id}`)
        toast({ title: 'Admin deleted' })
      } else {
        await axios.post(`/api/admin/admins/${id}/reset`)
        toast({ title: 'Reset link sent', description: `Password reset email sent to admin #${id}.` })
        router.push('/admin/admins')
      }
      await loadAdmins()
    } catch (err: unknown) {
      let message = 'Action failed. Please try again.'
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? err.message ?? message
      } else if (err instanceof Error) {
        message = err.message
      }
      console.error('[runAction]', message)
      toast({ title: 'Action failed', description: message })
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-950">Manage Admins</h1>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-950">Nickname</label>
          <input
            value={inviteNickname}
            onChange={(e) => setInviteNickname(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-100 bg-white placeholder:text-gray-600 focus:outline-none focus:ring 
             dark:bg-gray-800 dark:text-white dark:border-gray-600"
            disabled={inviting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-950">Email</label>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-300 bg-white placeholder:text-gray-600 focus:outline-none focus:ring 
             dark:bg-gray-800 dark:text-white dark:border-gray-600"
            disabled={inviting}
          />
        </div>
        <div>
          <Button type="submit" variant="primary" size="md" disabled={inviting} className="w-full">
            {inviting ? 'Inviting…' : 'Send Invite'}
          </Button>
        </div>
        {error && <p className="text-red-500 col-span-3">{error}</p>}
      </form>

      {/* Admins Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {['ID', 'Nickname', 'Email', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2 text-left font-medium text-gray-900">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              let displayName: string
              if (a.nickname?.trim()) {
                displayName = a.nickname
              } else if (a.email === process.env.NEXT_PUBLIC_ADMIN_SEED_EMAIL) {
                displayName = 'superadmin'
              } else {
                displayName = a.email.split('@')[0]
              }

              return (
                <tr key={a.id} className="border-b text-gray-900">
                  <td className="px-4 py-2">{a.id}</td>
                  <td className="px-4 py-2">{displayName}</td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => confirmAction('reset', a.id)}>
                      Reset Password
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => confirmAction('delete', a.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && pendingAction && (
        <ConfirmModal
          isOpen={modalOpen}
          title={pendingAction.type === 'delete' ? 'Delete Admin?' : 'Send Reset Link?'}
          description={
            pendingAction.type === 'delete'
              ? `Are you sure you want to delete admin #${pendingAction.id}?`
              : `Send password reset link to admin #${pendingAction.id}?`
          }
          onCancel={() => setModalOpen(false)}
          onConfirm={runAction}
        />
      )}
    </div>
  )
}
