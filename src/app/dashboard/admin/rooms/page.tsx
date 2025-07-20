'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'

type Room = {
  id: number
  block: string
  number: number
  price: number
  isFilled: boolean
  gender: string
}

type StudentBrief = {
  id: number
  fullName: string
  dept: string
  lastPaymentDate?: string
}

export default function AdminRoomsPage() {
  const [action, setAction] = useState<'new' | 'fill' | 'empty'>('new')
  const [rooms, setRooms] = useState<Room[]>([])
  const [emptyRooms, setEmptyRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [occupants, setOccupants] = useState<StudentBrief[]>([])
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // Fetch rooms on mount
  useEffect(() => {
    axios.get<Room[]>('/api/admin/rooms').then((res) => {
      const all = res.data
      setRooms(all.filter((r) => r.isFilled))
      setEmptyRooms(all.filter((r) => !r.isFilled))
    })
  }, [])

  // CREATE
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)

    const formEl = e.currentTarget; // FIX: capture form reference
    const form = new FormData(formEl)
    const blockVal = (form.get('block')?.toString() ?? '').trim().toUpperCase()
    const numberVal = Number(form.get('number'))
    const priceVal = Number(form.get('price'))
    const genderVal = (form.get('gender')?.toString() ?? '').toUpperCase()

    if (!blockVal || isNaN(numberVal) || isNaN(priceVal)) {
      alert('Please fill Block, Number, and Price correctly.')
      setCreating(false)
      return
    }

    try {
      const res = await axios.post<Room>('/api/admin/rooms', {
        block: blockVal,
        number: numberVal,
        price: priceVal,
        gender: genderVal,
      })

      // Optimistically update both lists
      setEmptyRooms((prev) => [...prev, res.data])
      // Clear form
      formEl.reset() // FIX: use the captured reference
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
       toast.error(err.response.data.message) 
     } else { 
       console.error(err) 
       toast.error('Unexpected error creating room') 
     }
    } finally {
      setCreating(false)
    }
  }

  // MARK FILLED/EMPTY
  const markRoom = async (room: Room, filled: boolean) => {
    try {
      await axios.patch(`/api/admin/rooms/${room.id}`, { isFilled: filled })
      // Move room between lists
      setRooms((prev) =>
        filled
          ? [...prev, room]
          : prev.filter((r) => r.id !== room.id)
      )
      setEmptyRooms((prev) =>
        !filled
          ? [...prev, room]
          : prev.filter((r) => r.id !== room.id)
      )
    } catch (err) {
      console.error(err)
      alert('Failed to update room status')
    }
  }

  // VIEW OCCUPANTS
  const viewOccupants = async (room: Room) => {
    try {
      const res = await axios.get<StudentBrief[]>(
        `/api/admin/rooms/${room.id}/occupants`
      )
      setOccupants(res.data)
      setSelectedRoom(room)
      setShowModal(true)
    } catch (err) {
      console.error(err)
      alert('Failed to load occupants')
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-60 p-6 space-y-4 bg-gray-500">
        {(['new','fill','empty'] as const).map((act) => (
          <button
            key={act}
            onClick={() => setAction(act)}
            className={`block w-full text-left font-bold uppercase ${
              action === act ? 'text-indigo-400' : 'text-white'
            }`}
          >
            {act === 'new'
              ? 'New Block & Room'
              : act === 'fill'
              ? 'Mark Room Filled'
              : 'Empty Room'}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto space-y-8">
        {/* New Room Form */}
        {action === 'new' && (
          <Card>
            <h2 className="text-2xl mb-4">Add New Room</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block">Block (A, B, C…)</label>
                <input name="block" required className="input" disabled={creating}/>
              </div>
              <div>
                <label className="block">Room Number</label>
                <input
                  name="number"
                  type="number"
                  required
                  className="input"
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block">Price</label>
                <input
                  name="price"
                  type="number"
                  required
                  className="input"
                  disabled={creating}
                />
              </div>
              <div>
            <label className="block">Gender</label>
            <select
              name="gender"
              required
              className="input"
              disabled={creating}
              defaultValue="" 
            > 
              <option value="" disabled> 
                -- Select Gender --
              </option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
                  </div>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={creating}
              >
                {creating ? <Spinner size={20} colorClass="text-white" /> : 'Create'}
              </button>
            </form>
          </Card>
        )}

        {/* Fill / Empty Controls */}
        {(action === 'fill' || action === 'empty') && (
          <Card>
            <h2 className="text-2xl mb-4">
              {action === 'fill' ? 'Mark as Filled' : 'Empty a Room'}
            </h2>
            <Table
              data={action === 'fill' ? emptyRooms : rooms}
              columns={[
                { header: 'Block', accessor: 'block' },
                { header: 'Room #', accessor: 'number' },
                { header: 'Price', accessor: 'price' },
                {
                  header: action === 'fill' ? 'Fill?' : 'Empty?',
                  accessor: 'id',
                  cell: (_: number, row: Room) => (
                    <button
                      onClick={() =>
                        markRoom(row, action === 'fill')
                      }
                      className="btn-secondary text-sm"
                    >
                      {action === 'fill' ? 'Mark Filled' : 'Empty Room'}
                    </button>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {/* Active & Empty Rooms */}
        <Card>
          <h2 className="text-2xl uppercase font-bold mb-4">Active Rooms</h2>
          <Table
            data={rooms}
            columns={[
              { header: 'Block', accessor: 'block' },
              { header: 'Room #', accessor: 'number' },
              { header: 'Price', accessor: 'price' },
              {
                header: 'Details',
                accessor: 'id',
                cell: (_: number, row: Room) => (
                  <button
                    onClick={() => viewOccupants(row)}
                    className="btn-secondary text-sm"
                  >
                    Details
                  </button>
                ),
              },
            ]}
          />

          <h2 className="text-2xl uppercase font-bold mt-8 mb-4">Empty Rooms</h2>
          <Table
            data={emptyRooms}
            columns={[
              { header: 'Block', accessor: 'block' },
              { header: 'Room #', accessor: 'number' },
              { header: 'Price', accessor: 'price' },
              {
                header: 'Details',
                accessor: 'id',
                cell: (_: number, row: Room) => (
                  <button
                    onClick={() => viewOccupants(row)}
                    className="btn-secondary text-sm"
                  >
                    Details
                  </button>
                ),
              },
            ]}
          />
        </Card>

        {/* Occupants Modal */}
        {showModal && selectedRoom && (
          <Modal onClose={() => setShowModal(false)}>
            <h3 className="text-xl font-semibold mb-4">
              Occupants of {selectedRoom.block}-{selectedRoom.number}
            </h3>
            <Table
              data={occupants}
              columns={[
                { header: 'Name', accessor: 'fullName' },
                { header: 'Dept', accessor: 'dept' },
                { header: 'Last Payment', accessor: 'lastPaymentDate' },
              ]}
            />
          </Modal>
        )}
      </main>
    </div>
  )
}