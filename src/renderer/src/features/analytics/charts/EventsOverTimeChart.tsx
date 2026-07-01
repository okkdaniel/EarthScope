import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TimeBucket } from '@shared/services/aggregate'

/**
 * A smooth area chart of new events per day over the last 30 days. Uses a single
 * accent colour and a soft gradient — no gridlines clutter (CLAUDE.md: calm,
 * restrained visuals).
 */
export function EventsOverTimeChart({ data }: { data: TimeBucket[] }): JSX.Element {
  const chartData = data.map((bucket) => ({
    date: new Date(bucket.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count: bucket.count
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="eventsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4c8bf5" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#4c8bf5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={40}
        />
        <Tooltip
          cursor={{ stroke: '#2a2f38' }}
          contentStyle={{
            background: '#1a1e25',
            border: '1px solid #2a2f38',
            borderRadius: 10,
            fontSize: 12,
            color: '#e7ebf0'
          }}
          labelStyle={{ color: '#9aa3af' }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#4c8bf5"
          strokeWidth={2}
          fill="url(#eventsGradient)"
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
