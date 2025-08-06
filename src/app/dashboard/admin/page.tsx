'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Select from 'react-select'
import autoTable from 'jspdf-autotable'
import jsPDF from 'jspdf'
import { Card } from '@/components/ui/Card'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Button from '@/components/ui/button'
import dynamic from 'next/dynamic'


type Option = { value: string; label: string }

export default function AdminDashboard() {
  const router = useRouter()
  const SessionChart = dynamic(() => import('@/components/SessionChart'), { ssr: false })

  // --- Session Management States ---
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [sessionInput, setSessionInput] = useState('')
  const [sessionMsg, setSessionMsg] = useState<string|null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // --- Export Modal States ---
  const [showExport, setShowExport] = useState(false)
  const [genders, setGenders] = useState<Option[]>([])
  const [years, setYears] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<Option[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [status, setStatus] = useState<'all'|'paid'|'unpaid'>('all')
  const [exportData, setExportData] = useState<any[]>([])
  const tableRef = useRef<HTMLTableElement>(null)

  // Fetch available years and genders
  useEffect(() => {
    // Fetch sessions for export filter
    fetch('/api/admin/sessions')
      .then(r => r.json())
      .then(data => setYears(data.sessions))
      
    // Initialize gender options
    setGenders([
      { value: 'MALE', label: 'Male' },
      { value: 'FEMALE', label: 'Female' }
    ])
  }, [])

  // Fetch export data when modal opens
  useEffect(() => {
    if (!showExport) return
    
    const params = new URLSearchParams()
    selectedGenders.forEach(g => params.append('gender', g.value))
    if (selectedYear) params.set('year', selectedYear)
    if (status !== 'all') params.set('paid', status)
    
    fetch(`/api/admin/students?${params.toString()}`)
      .then(r => r.json())
      .then(data => setExportData(data.students))
  }, [showExport, selectedGenders, selectedYear, status])

  // Start new session
  const handleFreshSession = async () => {
    if (!sessionInput.trim()) {
      setSessionMsg('Please enter a session label.')
      return
    }
    
    setIsLoading(true)
    try {
      const res = await axios.post('/api/admin/start-session', {
        newSession: sessionInput.trim(),
      })
      setSessionMsg(res.data.message || 'Session started!')
      setSessionModalOpen(false)
      setSessionInput('')
      router.refresh()
    } catch (err: any) {
      setSessionMsg(err.response?.data?.message || 'Failed to start session.')
    } finally {
      setIsLoading(false)
    }
  }

  // Export to PDF
  const downloadPdf = async () => {
  // 1) Build query params
  const params: Record<string,string> = {};
  selectedGenders.forEach(g => {
    params['gender'] = params['gender']
      ? `${params['gender']},${g.value}`
      : g.value;
  });
  if (selectedYear)   params.year = selectedYear;
  if (status !== 'all') params.paid = status;

  // 2) Fetch data on demand
  const res = await axios.get('/api/admin/students', { params });
  const students: any[] = res.data.students || [];

  // 3) Create PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  // 4) Add centered heading
  const heading = `Student List – Session ${selectedYear || 'All Years'}`;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(heading, pageWidth / 2, 15, { align: 'center' });

  // 5) Optional: draw a line under the heading
  pdf.setLineWidth(0.5);
  pdf.line(14, 18, pageWidth - 14, 18);

  // 6) Prepare table data
  const head = [['Name', 'Email', 'Gender', 'Year', 'Paid']];
  const body = students.map(s => [
    s.fullName,
    s.email,
    s.gender,
    s.sessionYear,
    s.hasPaid ? 'Yes' : 'No',
  ]);

  // 7) Render the table, starting just below the line
  autoTable(pdf, {
    head,
    body,
    startY: 22,            
    theme: 'striped',
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // 8) Save!
  pdf.save(`students_${selectedYear || 'all'}_${Date.now()}.pdf`);
};
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/admin/rooms">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Rooms</h2>
            <p>Manage blocks and rooms</p>
          </Card>
        </Link>
        
        <Link href="/dashboard/admin/students">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Students</h2>
            <p>View and edit student data</p>
          </Card>
        </Link>
        
        <Link href="/dashboard/admin/tickets">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Tickets</h2>
            <p>View and reply to tickets</p>
          </Card>
        </Link>
        
        <Link href="/dashboard/admin/logs">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Logs</h2>
            <p>View system logs</p>
          </Card>
        </Link>
        
        <Link href="/dashboard/admin/admins">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Admins</h2>
            <p>Manage admin users</p>
          </Card>
        </Link>
        
        <Link href="/dashboard/admin/payments">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Payments</h2>
            <p>Query &amp; manage payments</p>
          </Card>
        </Link>
        
        {/* Export Data Card */}
        <div onClick={() => setShowExport(true)} className="cursor-pointer">
          <Card className="hover:border-blue-600 hover:bg-blue-50">
            <h2 className="text-xl font-semibold mb-2 text-blue-600">
              Export Data
            </h2>
            <p>Download filtered student list</p>
          </Card>
        </div>
        
        {/* Start Fresh Session Card */}
        <div onClick={() => setSessionModalOpen(true)} className="cursor-pointer">
          <Card className="hover:border-red-600 hover:bg-red-50">
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Start Fresh Session
            </h2>
            <p>Clear all room occupants and begin a new session</p>
          </Card>
        </div>
      </div>

      <div className="sm:col-span-2 lg:col-span-4">
        <hr className='my-10' />
        <Card>
          <h2 className="text-xl font-semibold mb-4">Session Statistics</h2>
          <SessionChart />
        </Card>
      </div>

      {/* Session Feedback Message */}
      {sessionMsg && (
        <div className="mt-6 bg-green-100 text-green-800 p-3 rounded max-w-4xl mx-auto">
          {sessionMsg}
        </div>
      )}

      {/* Start Session Modal */}
      {sessionModalOpen && (
        <ConfirmModal
        isOpen={sessionModalOpen}
        
        title={<span className="text-gray-500">Start Fresh Session.</span>}
        description={
          <div className="space-y-2">
            <p>
              You&apos;re about to clear every student&apos;s room assignment and reset
              payment flags. Enter the new session label below:
            </p>
            <input
              type="text"
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value)}
              placeholder="e.g. 2025/2026"
              className="input w-full mt-2"
            />
          </div>
        }
        onConfirm={handleFreshSession}
        onCancel={() => {
          setSessionModalOpen(false)
          setSessionInput('')
        }}
        confirmLabel={isLoading ? 'Processing...' : 'Start Session'}
        cancelLabel="Cancel"
        disabledConfirm={isLoading}
      />
      
      )}

      {/* Export Data Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl space-y-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Export Students</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Gender</label>
                <Select
  isMulti
  options={genders}
  value={selectedGenders}
  onChange={(v) => setSelectedGenders(v as Option[])}
  placeholder="Filter by gender..."
  className="react-select-container"
  classNamePrefix="react-select"

     styles={{
        placeholder: (base) => ({...base,
      color: '#16A34A',         
     }),
     singleValue: (base) => ({...base,
      color: '#16A34A',
     }),
    multiValueLabel: (base) => ({...base, 
      color: '#16A34A',
    }),
    input: (base) => ({...base,
      color: '#16A34A',
    }),
  }}
/>
    </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Academic Year</label>
                <select
             className=" form-select  w-full
            text-green-600        
            border-gray-300        
            focus:border-green-500 
               focus:ring           
             focus:ring-opacity-50 "
       value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
>
  <option value="">All years</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2 text-gray-800">Payment Status</label>
              <div className="flex space-x-6">
  <label className="flex items-center space-x-2">
    <input
      type="radio"
      className="accent-gray-500 focus:ring-gray-500"
      checked={status === 'all'}
      onChange={() => setStatus('all')}
    />
    <span className="text-gray-700">All</span>
  </label>

  <label className="flex items-center space-x-2">
    <input
      type="radio"
      className="accent-green-500 focus:ring-green-500"
      checked={status === 'paid'}
      onChange={() => setStatus('paid')}
    />
    <span className="text-green-700">Paid</span>
  </label>

  <label className="flex items-center space-x-2">
    <input
      type="radio"
      className="accent-red-500 focus:ring-red-500"
      checked={status === 'unpaid'}
      onChange={() => setStatus('unpaid')}
    />
    <span className="text-red-700">Unpaid</span>
  </label>
</div>

            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowExport(false)}
              >
                Cancel
              </Button>
              <Button onClick={downloadPdf}>
                Download PDF
              </Button>
            </div>

            {/* Hidden table for PDF rendering */}
            <table ref={tableRef} className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Year</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {(exportData ?? []).map(s => (
                  <tr key={s.id}>
                    <td>{s.fullName}</td>
                    <td>{s.email}</td>
                    <td>{s.gender}</td>
                    <td>{s.sessionYear}</td>
                    <td>{s.hasPaid ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
