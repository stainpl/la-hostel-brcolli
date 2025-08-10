'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import Modal from './Modal'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export type StudentDTO = {
  id: number
  fullName: string
  regNo: string
  email: string
  phone: string
  state: string
  lga: string
  gender: 'MALE' | 'FEMALE'
  sponsorName: string
  sponsorPhone: string
  sessionYear: number
  profilePhoto?: string
  paymentStatus: 'PAID' | 'PENDING'
  ticketStatus: 'OPEN' | 'CLOSED'
}

interface Props {
  student: StudentDTO
  onClose: () => void
  onSave: (updated: StudentDTO) => void
}

export default function StudentEditModal({ student, onClose, onSave }: Props) {
  const [form, setForm] = useState<Omit<StudentDTO, 'id' | 'ticketStatus'>>({
    fullName: student.fullName || '',
    regNo: student.regNo || '',
    email: student.email || '',
    phone: student.phone || '',
    state: student.state || '',
    lga: student.lga || '',
    gender: student.gender || 'MALE',
    sponsorName: student.sponsorName || '',
    sponsorPhone: student.sponsorPhone || '',
    sessionYear: student.sessionYear || new Date().getFullYear(),
    profilePhoto: student.profilePhoto || '',
    paymentStatus: student.paymentStatus || 'PENDING',
  })

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(form.profilePhoto || '')
  const [loading, setLoading] = useState(false)

  // Manage preview URL and cleanup
  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(form.profilePhoto || '')
      return
    }
    const objectUrl = URL.createObjectURL(photoFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photoFile, form.profilePhoto])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'sessionYear' ? Number(value) : value,
    }))
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, String(value))
      })
      if (photoFile) {
        data.append('profilePhoto', photoFile)
      }

      const res = await axios.patch<StudentDTO>(
        `/api/admin/students/${student.id}`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      toast.success('Student updated!')
      onSave(res.data)
      handleClose()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Update failed')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPhotoFile(null)
    onClose()
  }

  return (
    <Modal onClose={handleClose}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Edit: {student.fullName}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {[
          { label: 'Full Name', name: 'fullName', required: true },
          { label: 'Reg No', name: 'regNo', required: true },
          { label: 'Email', name: 'email', type: 'email', required: true },
          { label: 'Phone', name: 'phone', type: 'tel', required: true },
          { label: 'State', name: 'state', required: true },
          { label: 'LGA', name: 'lga', required: true },
          { label: 'Sponsor Name', name: 'sponsorName' },
          { label: 'Sponsor Phone', name: 'sponsorPhone', type: 'tel' },
        ].map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-sm font-semibold text-gray-700"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              required={field.required}
              value={(form as any)[field.name]}
              onChange={handleChange}
              className="input w-full border-gray-400 focus:border-gray-600 placeholder-gray-500"
            />
          </div>
        ))}

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-semibold text-gray-700"
          >
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="input w-full"
            required
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sessionYear"
            className="block text-sm font-semibold text-gray-700"
          >
            Session Year
          </label>
          <input
            id="sessionYear"
            name="sessionYear"
            type="number"
            value={form.sessionYear}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>

        <div className="col-span-2">
          <label
            htmlFor="profilePhoto"
            className="block text-sm mb-1 font-semibold text-gray-900"
          >
            Profile Photo
          </label>
          <input
            id="profilePhoto"
            name="profilePhoto"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full"
          />
          {previewUrl && (
            <div className="mt-2 rounded overflow-hidden">
              <Image
                src={previewUrl || '/default-avatar.png'}
                alt="Profile Preview"
                width={128}
                height={128}
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>

        <div className="col-span-2 flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary px-4 py-2"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary px-4 py-2 font-bold text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
