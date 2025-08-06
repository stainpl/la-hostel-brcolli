// src/app/dashboard/admin/logs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

type Log = {
  id: number
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  message: string
  context?: string
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])

  async function fetchLogs() {
    const { data } = await axios.get<Log[]>('/api/admin/logs')
    setLogs(data)
  }

  useEffect(() => {
    fetchLogs()
    const iv = setInterval(fetchLogs, 10_000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-blue-800">System Logs</h1>

      <div className="bg-white rounded-xl shadow overflow-auto max-h-[60vh]">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {['Time', 'Level', 'Context', 'Message'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left font-medium text-gray-700 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr
                key={log.id}
                className={`
                  ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  hover:bg-gray-100
                `}
              >
                <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`
                      inline-block px-2 py-0.5 text-xs font-medium rounded-full
                      ${
                        log.level === 'ERROR'
                          ? 'bg-red-100 text-red-800'
                          : log.level === 'WARN'
                          ? 'bg-yellow-100 text-yellow-800'
                          : log.level === 'INFO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    `}
                  >
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                  {log.context ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2 font-mono text-gray-800">
                  {log.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
