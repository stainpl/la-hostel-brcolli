'use client'

import { useState,  ChangeEvent, FormEvent } from 'react'
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
  const [form, setForm] = useState<Omit<StudentDTO,'id'|'ticketStatus'>>({
  fullName:      student.fullName  || '',
  regNo:         student.regNo     || '',
  email:         student.email     || '',
  phone:         student.phone     || '',
  state:         student.state     || '',
  lga:           student.lga       || '',
  gender:        student.gender    || 'MALE',      // or '' if you want the select to start blank
  sponsorName:   student.sponsorName || '',
  sponsorPhone:  student.sponsorPhone|| '',
  sessionYear:   student.sessionYear || new Date().getFullYear(),
  profilePhoto:  student.profilePhoto || '',        // if you bind value to it
  paymentStatus: student.paymentStatus || 'PENDING',
})
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name==='sessionYear'? Number(value) : value }))
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k,v]) => {
        data.append(k, v as string)
      })
      if (photoFile) data.append('profilePhoto', photoFile)

      const res = await axios.patch<StudentDTO>(
        `/api/admin/students/${student.id}`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      toast.success('Student updated!')
      onSave(res.data)
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit: {student.fullName}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="input w-full border-gray-400 focus:border-gray-600 placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Reg No</label>
          <input
            name="regNo"
            value={form.regNo}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="input w-full border-gray-400 focus:border-gray-600 placeholder-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Phone</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">State</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">LGA</label>
          <input
            name="lga"
            value={form.lga}
            onChange={handleChange}
            className="input w-full border-gray-400 focus:border-gray-600 placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="input w-full border-gray-400 focus:border-gray-600 placeholder-gray-500"
            required
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Session Year</label>
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
          <label className="block text-sm font-semibold text-gray-700">Sponsor Name</label>
          <input
            name="sponsorName"
            value={form.sponsorName}
            onChange={handleChange}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Sponsor Phone</label>
          <input
            name="sponsorPhone"
            type="tel"
            value={form.sponsorPhone}
            onChange={handleChange}
            className="input w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1 font-semibold text-gray-900">Profile Photo</label>
          <input
            name="profilePhoto"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full"
          />
          {form.profilePhoto && (
            <div className="mt-2 rounded overflow-hidden">
              <Image
                src={photoFile ? URL.createObjectURL(photoFile) : form.profilePhoto}
                alt="Preview"
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
            onClick={onClose}
            className="btn-secondary px-4 py-2"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary px-4 py-2 font-bold text-white">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}
