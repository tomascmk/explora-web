'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: number       // e.g. +12.5 or -3.2
  trendLabel?: string  // e.g. "vs last month"
  prefix?: string      // e.g. "$"
  suffix?: string      // e.g. "%"
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

const variantStyles: Record<string, { iconBg: string; iconColor: string }> = {
  default: { iconBg: 'var(--color-section-bg)', iconColor: 'var(--color-text-secondary)' },
  primary: { iconBg: 'var(--color-primary-light)', iconColor: 'var(--color-primary)' },
  success: { iconBg: 'var(--color-success-light)', iconColor: 'var(--color-success)' },
  warning: { iconBg: 'var(--color-warning-light)', iconColor: 'var(--color-warning)' },
  danger: { iconBg: 'var(--color-danger-light)', iconColor: 'var(--color-danger)' },
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  prefix = '',
  suffix = '',
  variant = 'default',
}: StatsCardProps) {
  const styles = variantStyles[variant]
  const isPositive = trend != null && trend >= 0

  return (
    <div
      className='rounded-xl p-3 sm:p-5 border transition-shadow hover:shadow-md'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)',
      }}
    >
      <div className='flex items-start justify-between mb-2 sm:mb-3'>
        <p
          className='text-sm font-medium'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </p>
        {icon && (
          <div
            className='w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0'
            style={{ backgroundColor: styles.iconBg, color: styles.iconColor }}
          >
            {icon}
          </div>
        )}
      </div>

      <p
        className='text-lg sm:text-2xl font-bold mb-1'
        style={{ color: 'var(--color-text-heading)' }}
      >
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>

      {trend != null && (
        <div className='flex items-center gap-1.5'>
          <div
            className='flex items-center gap-0.5 text-xs font-semibold'
            style={{
              color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
            }}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{isPositive ? '+' : ''}{trend.toFixed(1)}%</span>
          </div>
          {trendLabel && (
            <span className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
