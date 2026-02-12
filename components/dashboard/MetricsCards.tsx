'use client';

import { TrendingUp, TrendingDown, DollarSign, Calendar, Star, Users } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: 'dollar' | 'calendar' | 'star' | 'users';
  trend?: 'up' | 'down';
}

const icons = {
  dollar: DollarSign,
  calendar: Calendar,
  star: Star,
  users: Users,
};

export function MetricCard({ title, value, change, icon = 'users', trend }: MetricCardProps) {
  const Icon = icons[icon];
  const isPositive = trend === 'up' || (change && change.startsWith('+'));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        {change && (
          <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface MetricsCardsProps {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  conversionRate: number;
  bookingGrowth: number;
  revenueGrowth: number;
}

export function MetricsCards({
  totalBookings,
  totalRevenue,
  averageRating,
  conversionRate,
  bookingGrowth,
  revenueGrowth,
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Bookings"
        value={totalBookings}
        change={`${bookingGrowth > 0 ? '+' : ''}${(bookingGrowth * 100).toFixed(1)}%`}
        icon="calendar"
        trend={bookingGrowth > 0 ? 'up' : 'down'}
      />
      <MetricCard
        title="Total Revenue"
        value={`$${totalRevenue.toFixed(2)}`}
        change={`${revenueGrowth > 0 ? '+' : ''}${(revenueGrowth * 100).toFixed(1)}%`}
        icon="dollar"
        trend={revenueGrowth > 0 ? 'up' : 'down'}
      />
      <MetricCard
        title="Average Rating"
        value={averageRating.toFixed(1)}
        icon="star"
      />
      <MetricCard
        title="Conversion Rate"
        value={`${(conversionRate * 100).toFixed(1)}%`}
        icon="users"
      />
    </div>
  );
}
