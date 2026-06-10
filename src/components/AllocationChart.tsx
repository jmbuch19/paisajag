'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { rupeesShort, percent } from '@/lib/format'

export interface AllocationSlice {
  name: string
  value: number
}

// Decorative palette — amber-600 allowed here (non-text UI).
const COLOURS = ['#C97B2A', '#1D9E75', '#378ADD', '#FAC775', '#9E9D96']

export function AllocationChart({ data }: { data: AllocationSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  return (
    <div>
      <div className="h-44" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLOURS[i % COLOURS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend doubles as the accessible representation —
          numbers never rely on colour alone */}
      <ul className="mt-2 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLOURS[i % COLOURS.length] }}
              aria-hidden
            />
            <span className="flex-1 text-gray-600">{d.name}</span>
            <span className="font-medium text-gray-900 tabular-nums">
              {rupeesShort(d.value)}
            </span>
            <span className="w-12 text-right text-gray-400 tabular-nums">
              {percent((d.value / total) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
