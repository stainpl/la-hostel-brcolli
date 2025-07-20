'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export type StudentData = {
  id:            number
  fullName:      string
  regNo:         string
  phone:         string
  email:         string
  state:         string
  lga:           string
  gender:        'MALE' | 'FEMALE'
  sponsorName:   string
  sponsorPhone:  string
  sessionYear:   number
  roomId:        number | null
  hasPaid:       boolean
  profilePhoto?: string | null
}

interface Props {
  initialData: StudentData
}

export default function EditStudentForm({ initialData }: Props) {
  const [form, setForm] = useState({
    fullName:     initialData.fullName,
    regNo:        initialData.regNo,
    phone:        initialData.phone,
    email:        initialData.email,
    state:        initialData.state,
    lga:          initialData.lga,
    gender:       initialData.gender,
    sponsorName:  initialData.sponsorName,
    sponsorPhone: initialData.sponsorPhone,
    sessionYear:  initialData.sessionYear.toString(),
    roomId:       initialData.roomId ? initialData.roomId.toString() : '',
    hasPaid:      initialData.hasPaid,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(initialData.profilePhoto || '')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router                = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      // Only HTMLInputElement has 'checked'
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('fullName', form.fullName)
      formData.append('regNo', form.regNo)
      formData.append('phone', form.phone)
      formData.append('email', form.email)
      formData.append('state', form.state)
      formData.append('lga', form.lga)
      formData.append('gender', form.gender)
      formData.append('sponsorName', form.sponsorName)
      formData.append('sponsorPhone', form.sponsorPhone)
      formData.append('sessionYear', form.sessionYear)
      formData.append('roomId', form.roomId)
      formData.append('hasPaid', String(form.hasPaid))
      if (imageFile) {
        formData.append('profilePhoto', imageFile)
      }

      await axios.patch(
        `/api/admin/students/${initialData.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      setSuccess('Student updated successfully!')
      setTimeout(() => router.push('/dashboard/admin/students'), 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <div className="flex space-x-6">
        <div className="w-32 h-32">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              No Photo
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="mt-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1">

          <div>
            <label className="block font-semibold">Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">Registration No.</label>
            <input
              name="regNo"
              value={form.regNo}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input w-full"
              type="tel"
            />
          </div>
          <div>
            <label className="block font-semibold">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full"
              type="email"
            />
          </div>
          <div>
            <label className="block font-semibold">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">LGA</label>
            <input
              name="lga"
              value={form.lga}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">Sponsor Name</label>
            <input
              name="sponsorName"
              value={form.sponsorName}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">Sponsor Phone</label>
            <input
              name="sponsorPhone"
              value={form.sponsorPhone}
              onChange={handleChange}
              className="input w-full"
              type="tel"
            />
          </div>
          
          <div>
            <label className="block font-semibold">Gender</label>
            <select
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
            <label className="block font-semibold">Session Year</label>
            <input
              name="sessionYear"
              type="number"
              value={form.sessionYear}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block font-semibold">Room ID</label>
            <input
              name="roomId"
              type="number"
              value={form.roomId}
              onChange={handleChange}
              className="input w-full"
              placeholder="leave blank if none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="hasPaid"
              name="hasPaid"
              type="checkbox"
              checked={form.hasPaid}
              onChange={handleChange}
              className="checkbox"
            />
            <label htmlFor="hasPaid" className="font-semibold">Payment Confirmed</label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}