'use client'

import useSWR from 'swr'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  TooltipProps
} from 'recharts'
import { motion } from 'framer-motion'

type Stats = { gender: string; total: number; paid: number }

const COLORS = {
  total: ['#2563eb', '#1e40af', '#3b82f6'], 
  paid: ['#059669', '#15803d', '#10b981']   
}

const CustomLegend = () => (
  <div className="flex flex-wrap justify-center gap-4 mb-8">
    {[
      { label: 'Total Sessions', color: 'bg-blue-500', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]' },
      { label: 'Paid Sessions', color: 'bg-green-500', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]' },
      { label: 'Unpaid Sessions', color: 'bg-gray-400', glow: '' }
    ].map(({ label, color, glow }) => (
      <div
        key={label}
        className={
          `flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gradient-to-br from-gray-50 to-white ${glow}`
        }
      >
        <span className={`w-4 h-4 rounded-full ${color}`}></span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    ))}
  </div>
)

// Strictly type the payload for recharts tooltip
interface RechartsPayload {
  payload: Stats
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: RechartsPayload[]
  label?: string
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null
  // payload[0].payload will have the chart data for this bar
  const { total, paid } = payload[0].payload
  const unpaid = total - paid
  const paidPct = ((paid / total) * 100).toFixed(0)
  const unpaidPct = ((unpaid / total) * 100).toFixed(0)

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      <div className="space-y-1 text-sm">
        <p className="text-blue-600">Total: <span className="font-medium">{total.toLocaleString()}</span></p>
        <p className="text-green-600">Paid: <span className="font-medium">{paid.toLocaleString()} ({paidPct}%)</span></p>
        <p className="text-gray-500">Unpaid: <span className="font-medium">{unpaid.toLocaleString()} ({unpaidPct}%)</span></p>
      </div>
    </div>
  )
}

const calculateBarSize = (max: number, min: number) => {
  const ratio = max / (min || 1)
  if (ratio > 100) return 20
  if (ratio > 30) return 25
  if (ratio > 10) return 30
  return 40
}

export default function SessionChart() {
  const { data, error } = useSWR<Stats[]>('/api/admin/session-stats', (url: string) => fetch(url).then(r => r.json()))
  if (error) return <p className="text-red-600">Error loading stats</p>
  if (!data) return <p className="text-gray-500">Loading sessions...</p>

  const totals = data.map(d => d.total)
  const maxTotal = Math.max(...totals)
  const minTotal = Math.min(...totals)
  const barSize = calculateBarSize(maxTotal, minTotal)

  const chartData = data.map(item => ({
    ...item,
    unpaid: item.total - item.paid,
    paidPct: item.paid / item.total > 0.05 ? `${Math.round((item.paid / item.total) * 100)}%` : ''
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
        Session Statistics
      </h2>

      <CustomLegend />

      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            barCategoryGap="15%"
            barSize={barSize}
            margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#eef2f7" />
            <XAxis
              type="number"
              domain={[0, maxTotal * 1.1]}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              dataKey="gender"
              type="category"
              width={100}
              tick={{ fill: '#374151', fontSize: 14 }}
            />
            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="total" stackId="a" radius={[0, 6, 6, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS.total[i % COLORS.total.length]} />
              ))}
            </Bar>
            <Bar dataKey="paid" stackId="a" radius={[6, 0, 0, 6]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS.paid[i % COLORS.paid.length]} />
              ))}
              <LabelList dataKey="paidPct" position="right" style={{ fontSize: 12, fill: '#374151' }} />
            </Bar>
            <Bar dataKey="unpaid" stackId="a" fill="#f3f4f6" animationDuration={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {maxTotal > 100 && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Showing range from {minTotal.toLocaleString()} to {maxTotal.toLocaleString()}
        </p>
      )}
    </motion.div>
  )
}
