'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import Spinner from '../ui/Spinner'

export default function RegistrationForm() {
  const [form, setForm] = useState({
    fullName: '',
    regNo: '',
    phone: '',
    email: '',
    state: '',
    lga: '',
    gender: '',
    sponsorName: '',
    sponsorPhone: '',
    sessionYear: '',
    password: '',
    confirmPassword: '',
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Generate and clean up preview URL when profilePhoto changes
  useEffect(() => {
    if (profilePhoto) {
      const url = URL.createObjectURL(profilePhoto)
      setPreviewUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
    setPreviewUrl(null)
  }, [profilePhoto])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0])
    }
  }

  // Reset form fields
  const resetFields = () => {
    setForm({
      fullName: '',
      regNo: '',
      phone: '',
      email: '',
      state: '',
      lga: '',
      gender: '',
      sponsorName: '',
      sponsorPhone: '',
      sessionYear: '',
      password: '',
      confirmPassword: '',
    })
    setProfilePhoto(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        data.append(key, val as string)
      })
      if (profilePhoto) {
        data.append('profilePhoto', profilePhoto)
      }

      await axios.post('/api/students', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Registration sucessful ! You can now login.')
      setRegistrationSuccess(true)
      resetFields()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {registrationSuccess && (
        <div className="p-2 rounded bg-green-50 text-green-800 text-center font-medium border border-green-200">
          Registration successful! You can now login.
        </div>
      )}

      <input
        name="fullName"
        placeholder="Full Name"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.fullName}
      />

      <input
        name="regNo"
        placeholder="Reg No"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.regNo}
      />

      <input
        name="phone"
        type="tel"
        placeholder="Phone"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.phone}
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.email}
      />

      <input
        name="state"
        placeholder="State"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.state}
      />

      <input
        name="lga"
        placeholder="LGA"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.lga}
      />

      <select
        name="gender"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.gender}
      >
        <option value="">Select Gender</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </select>

      <input
        name="sponsorName"
        placeholder="Sponsor Name"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.sponsorName}
      />

      <input
        name="sponsorPhone"
        type="tel"
        placeholder="Sponsor Phone"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.sponsorPhone}
      />

      <input
        name="sessionYear"
        type="number"
        placeholder="Session Year"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.sessionYear}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.password}
      />

      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        onChange={handleChange}
        required
        className="input"
        disabled={loading}
        value={form.confirmPassword}
      />

      {/* Profile Photo Input with Preview */}
      <div>
        <label className="block mb-1 font-bold text-gray-700">Profile Photo</label>
        <div className="flex items-center space-x-4">
          <label
            htmlFor="profilePhoto"
            className="cursor-pointer inline-block px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            {profilePhoto ? 'Change Photo' : 'Choose Photo'}
          </label>
          <span className="text-sm text-gray-500 truncate">
            {profilePhoto?.name || 'No file chosen'}
          </span>
        </div>
        <input
          id="profilePhoto"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        {/* Preview */}
        {previewUrl && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-1">Preview:</p>
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="w-24 h-24 object-cover rounded-full border border-gray-300 shadow-sm"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center"
        disabled={loading}
      >
        {loading ? <Spinner size={20} colorClass="text-white" /> : 'Register'}
      </button>
    </form>
  )
}