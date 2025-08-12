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

type FormState = Omit<StudentDTO, 'id' | 'ticketStatus'>

interface Props {
  student: StudentDTO
  onClose: () => void
  onSave: (updated: StudentDTO) => void
}

const MAX_PHOTO_SIZE = 3 * 1024 * 1024 // 3 MB

export default function StudentEditModal({ student, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>({
    fullName: student.fullName ?? '',
    regNo: student.regNo ?? '',
    email: student.email ?? '',
    phone: student.phone ?? '',
    state: student.state ?? '',
    lga: student.lga ?? '',
    gender: student.gender ?? 'MALE',
    sponsorName: student.sponsorName ?? '',
    sponsorPhone: student.sponsorPhone ?? '',
    sessionYear: student.sessionYear ?? new Date().getFullYear(),
    profilePhoto: student.profilePhoto ?? '',
    paymentStatus: student.paymentStatus ?? 'PENDING',
  })

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(form.profilePhoto ?? '')
  const [loading, setLoading] = useState(false)

  // Create preview when a new file is selected; clean up previous object URL
  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(form.profilePhoto ?? '')
      return
    }
    const objectUrl = URL.createObjectURL(photoFile)
    setPreviewUrl(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [photoFile, form.profilePhoto])

  // typed fields so accessing form[name] is safe
  const fields: Array<{
    label: string
    name: keyof FormState
    type?: string
    required?: boolean
  }> = [
    { label: 'Full Name', name: 'fullName', required: true },
    { label: 'Reg No', name: 'regNo', required: true },
    { label: 'Email', name: 'email', type: 'email', required: true },
    { label: 'Phone', name: 'phone', type: 'tel', required: true },
    { label: 'State', name: 'state', required: true },
    { label: 'LGA', name: 'lga', required: true },
    { label: 'Sponsor Name', name: 'sponsorName' },
    { label: 'Sponsor Phone', name: 'sponsorPhone', type: 'tel' },
  ]

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as keyof FormState
    const rawValue = e.target.value

    // sessionYear must be a number, everything else string
    const value: FormState[typeof name] =
      name === 'sessionYear' ? (Number(rawValue) as FormState['sessionYear']) : (rawValue as FormState[typeof name])

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) {
      setPhotoFile(null)
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error('Profile photo is too large (max 3 MB).')
      return
    }
    setPhotoFile(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()

      // Append only defined keys from form
      (Object.keys(form) as Array<keyof FormState>).forEach((key) => {
        const value = form[key]
        // FormData only accepts strings / blobs — convert numbers to strings
        if (value !== undefined && value !== null) {
          data.append(key, typeof value === 'number' ? String(value) : String(value))
        }
      })

      if (photoFile) {
        data.append('profilePhoto', photoFile)
      }

      const res = await axios.patch<StudentDTO>(`/api/admin/students/${student.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Student updated!')
      onSave(res.data)
      // reset local file state and close
      setPhotoFile(null)
      onClose()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMsg =
          (err.response?.data && (err.response.data as any).message) ?? err.message
        toast.error(serverMsg || 'Update failed')
      } else if (err instanceof Error) {
        toast.error(err.message)
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
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit: {student.fullName}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={String(field.name)}>
            <label htmlFor={String(field.name)} className="block text-sm font-semibold text-gray-700">
              {field.label}
            </label>
            <input
              id={String(field.name)}
              name={String(field.name)}
              type={field.type ?? 'text'}
              required={field.required}
              value={String(form[field.name] ?? '')}
              onChange={handleChange}
              className="input w-full border-gray-400 focus:border-gray-600 placeholder-gray-500"
              aria-required={field.required ?? false}
            />
          </div>
        ))}

        <div>
          <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
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
          <label htmlFor="sessionYear" className="block text-sm font-semibold text-gray-700">
            Session Year
          </label>
          <input
            id="sessionYear"
            name="sessionYear"
            type="number"
            value={String(form.sessionYear)}
            onChange={handleChange}
            className="input w-full"
            required
            min={1900}
            max={2100}
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="profilePhoto" className="block text-sm mb-1 font-semibold text-gray-900">
            Profile Photo
          </label>
          <input
            id="profilePhoto"
            name="profilePhoto"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full"
            aria-describedby="photo-help"
          />
          <p id="photo-help" className="text-xs text-gray-500 mt-1">
            Max size: 3MB. Leave empty to keep existing photo.
          </p>

          {previewUrl && (
            <div className="mt-2 rounded overflow-hidden w-32 h-32">
              <Image
                src={previewUrl || '/default-avatar.png'}
                alt="Profile Preview"
                width={128}
                height={128}
                className="object-cover rounded"
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
          <button type="submit" className="btn-primary px-4 py-2 font-bold text-white" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
