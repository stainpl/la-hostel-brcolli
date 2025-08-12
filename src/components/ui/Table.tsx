'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

/**
 * Column<T, K> — `K` is the specific key of T this column points to.
 * cell receives the correctly typed value: T[K]
 */
export type Column<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T
> = {
  header: string
  accessor: K
  cell?: (value: T[K], row: T) => ReactNode
}

interface TableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]             // columns can use any accessor key of T
  getRowKey?: (row: T, index: number) => string | number
  className?: string
}

export default function Table<T extends Record<string, unknown>>({
  data,
  columns,
  getRowKey,
  className,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('w-full table-auto border-collapse', className)}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                scope="col"
                className="px-4 py-2 text-left bg-gray-500 text-white font-medium uppercase text-sm"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const rowKey = getRowKey?.(row, i) ?? i
              return (
                <tr key={rowKey} className={i % 2 === 0 ? 'bg-blue-50' : 'bg-gray-50'}>
                  {columns.map((col) => {
                    const value = row[col.accessor] // TS types this as T[keyof T]
                    return (
                      <td key={String(col.accessor)} className="px-4 py-2 text-sm">
                        {col.cell ? col.cell(value as any, row) : String(value ?? '')}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
