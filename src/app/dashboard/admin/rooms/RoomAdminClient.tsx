// src/app/dashboard/admin/rooms/RoomsAdminClient.tsx
'use client'

import React, { useState } from 'react'
import axios from 'axios'
import Button from '@/components/ui/button'
import ConfirmModal from '@/components/ui/ConfirmModal'

export type RoomWithCounts = {
  id: number
  label: string
  block: string
  number: number
  price: number
  gender: 'MALE' | 'FEMALE'
  totalStudents: number
  paidCount: number
  students: Array<{ hasPaid: boolean }>
}

type Gender = 'MALE' | 'FEMALE'
type GenderFilter = 'ALL' | Gender
type OccupancyFilter = 'ALL' | 'OCCUPIED' | 'EMPTY'

interface Props {
  rooms: RoomWithCounts[]
}

export default function RoomsAdminClient({ rooms }: Props) {
  // — Form state —
  const [block, setBlock] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [price, setPrice] = useState('')
  const [gender, setGender] = useState<Gender>('MALE')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // — Filter & modal state —
  const [filterGender, setFilterGender] = useState<GenderFilter>('ALL')
  const [filterOcc, setFilterOcc] = useState<OccupancyFilter>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomWithCounts | null>(null)

  // 1) Add room
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const num = Number(roomNumber)
    const amt = Number(price)
    if (!block.trim() || isNaN(num) || isNaN(amt)) {
      setError('All fields are required and must be valid numbers.')
      return
    }
    setAdding(true)
    try {
      await axios.post('/api/admin/rooms', {
        block: block.toUpperCase(),
        number: num,
        price: amt,
        gender,
      })
      setBlock('')
      setRoomNumber('')
      setPrice('')
      setGender('MALE')
      window.location.reload()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(
          `Room ${block.toUpperCase()}-${num} for ${gender.toLowerCase()}s already exists.`
        )
      } else if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to add room.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setAdding(false)
    }
  }

  // 2) Filters
  const filtered = rooms.filter((r) => {
    if (filterGender !== 'ALL' && r.gender !== filterGender) return false
    if (filterOcc === 'OCCUPIED' && r.totalStudents === 0) return false
    if (filterOcc === 'EMPTY' && r.totalStudents > 0) return false
    return true
  })

  // 3) Modal open/close
  const openDetails = (r: RoomWithCounts) => {
    setSelectedRoom(r)
    setModalOpen(true)
  }
  const closeDetails = () => {
    setModalOpen(false)
    setSelectedRoom(null)
  }

  // 4) Mark filled
  const markFilled = async (id: number) => {
    await axios.patch(`/api/admin/rooms/${id}`, { isFilled: true })
    window.location.reload()
  }

  // 5) Delete room
  const handleDelete = async (id: number) => {
    if (!confirm('Really delete this room?')) return
    await axios.delete(`/api/admin/rooms/${id}`)
    window.location.reload()
  }

  return (
    <>
      {/* Add Room Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-4 rounded shadow grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
      >
        {/* Block */}
        <div>
          <label className="block text-sm font-medium text-gray-950">Block</label>
          <input
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="input w-full text-gray-500"
            placeholder="A, B, C…"
            disabled={adding}
          />
        </div>
        {/* Room # */}
        <div>
          <label className="block text-sm font-medium text-gray-950">Room No</label>
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            type="number"
            className="input w-full text-gray-500"
            disabled={adding}
          />
        </div>
        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-950">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="input w-full text-gray-500"
            disabled={adding}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-950">Price (₦)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            className="input w-full text-gray-500"
            disabled={adding}
          />
        </div>
        {/* Submit */}
        <div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={adding}
            className="w-full"
          >
            {adding ? 'Adding…' : 'Add Room'}
          </Button>
        </div>
        {error && <p className="text-red-500 col-span-5">{error}</p>}
      </form>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2">
        <select
          className="input w-full sm:w-40 text-gray-500"
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value as GenderFilter)}
        >
          <option value="ALL">All Genders</option>
          <option value="MALE">Male Only</option>
          <option value="FEMALE">Female Only</option>
        </select>
        <select
          className="input w-full sm:w-40 text-gray-500"
          value={filterOcc}
          onChange={(e) => setFilterOcc(e.target.value as OccupancyFilter)}
        >
          <option value="ALL">All Rooms</option>
          <option value="OCCUPIED">With Participants</option>
          <option value="EMPTY">No Participants</option>
        </select>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={`p-3 rounded-lg shadow cursor-pointer ${
              r.totalStudents === 0 ? 'bg-green-50' : 'bg-white'
            }`}
            onClick={() => openDetails(r)}
          >
            <div className="font-bold text-lg text-gray-500">
              {r.label} • {r.gender === 'MALE' ? 'Male' : 'Female'}
            </div>
            <div className="text-sm text-gray-600">
              ₦{r.price.toLocaleString()}
            </div>
            <div className="text-xs mt-1">
              {r.totalStudents} student{r.totalStudents !== 1 && 's'} ({r.paidCount} paid)
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {modalOpen && selectedRoom && (
        <ConfirmModal
          isOpen={modalOpen}
          title={<span className="text-gray-500">Room {selectedRoom.label}</span>}
          description={
            <div className="space-y-2 text-sm text-gray-950">
              <p>Block: {selectedRoom.block}</p>
              <p>Room #: {selectedRoom.number}</p>
              <p>Price: ₦{selectedRoom.price.toLocaleString()}</p>
              <p>Gender: {selectedRoom.gender}</p>
              <p>Total students: {selectedRoom.totalStudents}</p>
              <p>Paid: {selectedRoom.paidCount}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(selectedRoom.id)}
                >
                  Delete Room
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => markFilled(selectedRoom.id)}
                >
                  Mark Filled
                </Button>
              </div>
            </div>
          }
          onCancel={closeDetails}
          onConfirm={() => null}
        />
      )}
    </>
  )
}
