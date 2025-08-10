// src/components/ui/Table.tsx
'use client'

import { ReactNode } from 'react'

export type Column<T> = {
  header: string
  accessor: keyof T
  cell?: (value: any, row: T) => ReactNode
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
}

export default function Table<T>({ data, columns }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className="px-4 py-2 text-left bg-gray-500 font-medium uppercase text-sm"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? 'bg-blue-50' : 'bg-gray-50'}
            >
              {columns.map((col) => {
                const value = row[col.accessor]
                return (
                  <td key={String(col.accessor)} className="px-4 py-2 text-sm">
                    {col.cell ? col.cell(value, row) : String(value ?? '')}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
