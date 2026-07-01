import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TimeBucket } from '@shared/services/aggregate'

const INK = '#0a0a0a'
const QUIET = '#8a8a86'
const RULE = '#e7e7e3'

/**
 * New events per day over 30 days, drawn as a thin ink line on the warm canvas.
 * Monochrome, no gradient, hairline gridlines — an engineering plot, not a
 * dashboard chart.
 */
export function EventsOverTimeChart({ data }: { data: TimeBucket[] }): JSX.Element {
  const chartData = data.map((bucket) => ({
    date: new Date(bucket.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count: bucket.count
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={RULE} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: QUIET, fontSize: 11 }}
          axisLine={{ stroke: INK }}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: QUIET, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={40}
        />
        <Tooltip
          cursor={{ stroke: QUIET }}
          contentStyle={{
            background: '#f4f4f2',
            border: '1px solid #0a0a0a',
            borderRadius: 0,
            fontSize: 12,
            color: '#0a0a0a'
          }}
          labelStyle={{ color: '#6b6b68' }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={INK}
          strokeWidth={1.25}
          fill={INK}
          fillOpacity={0.04}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
