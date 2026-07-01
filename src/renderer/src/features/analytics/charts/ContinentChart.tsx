import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { NamedCount } from '@shared/services/aggregate'

const INK = '#0a0a0a'
const QUIET = '#6b6b68'

/** Events by approximate continent, as ink bars — monochrome, square corners. */
export function ContinentChart({ data }: { data: NamedCount[] }): JSX.Element {
  if (data.length === 0) {
    return <p className="py-6 text-sm text-content-secondary">No regional data.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
        barCategoryGap={12}
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: QUIET, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={104}
        />
        <Tooltip
          cursor={{ fill: '#efefec' }}
          contentStyle={{
            background: '#f4f4f2',
            border: '1px solid #0a0a0a',
            borderRadius: 0,
            fontSize: 12,
            color: '#0a0a0a'
          }}
        />
        <Bar dataKey="count" fill={INK} radius={0} animationDuration={600} barSize={10} />
      </BarChart>
    </ResponsiveContainer>
  )
}
