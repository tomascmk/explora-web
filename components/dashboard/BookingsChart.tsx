'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { theme } from '@/lib/theme';

interface BookingsChartProps {
  data: Array<{
    period: string;
    count: number;
    revenue: number;
  }>;
}

export function BookingsChart({ data }: BookingsChartProps) {
  return (
    <div
      className="rounded-xl border p-4 sm:p-6"
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)',
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--color-text-heading)' }}
      >
        Bookings by Period
      </h2>
      <div className="h-[200px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.charts.grid} />
          <XAxis
            dataKey="period"
            tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
            stroke={theme.charts.grid}
          />
          <YAxis
            tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
            stroke={theme.charts.grid}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.charts.tooltip.bg,
              border: 'none',
              borderRadius: '8px',
              color: theme.charts.tooltip.text,
            }}
            labelStyle={{ color: theme.charts.tooltip.text }}
            itemStyle={{ color: theme.charts.tooltip.text }}
          />
          <Legend />
          <Bar
            dataKey="count"
            fill={theme.charts.primary}
            name="Bookings"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
