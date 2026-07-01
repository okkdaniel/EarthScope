import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { NamedCount } from '@shared/services/aggregate'

const BAR_COLOR = '#4c8bf5'

/** Horizontal bar chart of events grouped by approximate continent. */
export function ContinentChart({ data }: { data: NamedCount[] }): JSX.Element {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-content-tertiary">No regional data.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
        barCategoryGap={10}
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#9aa3af', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={96}
        />
        <Tooltip
          cursor={{ fill: '#1a1e25' }}
          contentStyle={{
            background: '#1a1e25',
            border: '1px solid #2a2f38',
            borderRadius: 10,
            fontSize: 12,
            color: '#e7ebf0'
          }}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={600}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={BAR_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
