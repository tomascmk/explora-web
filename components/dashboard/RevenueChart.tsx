'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { theme } from '@/lib/theme';

interface RevenueChartProps {
  data: Array<{
    period: string;
    amount: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = data.map(item => ({
    period: item.period,
    revenue: item.amount,
  }));

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
        Revenue Over Time
      </h2>
      <div className="h-[200px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
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
            formatter={(value: number) => `$${value.toFixed(2)}`}
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
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={theme.charts.primary}
            strokeWidth={2}
            name="Revenue"
            dot={{ fill: theme.charts.primary, r: 4 }}
            activeDot={{ fill: theme.charts.secondary, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
