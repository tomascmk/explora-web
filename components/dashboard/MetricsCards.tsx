'use client';

import { DollarSign, Calendar, Star, Users } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      <StatsCard
        label="Total Bookings"
        value={totalBookings}
        icon={<Calendar className="w-5 h-5" />}
        trend={bookingGrowth * 100}
        trendLabel="vs last period"
        variant="primary"
      />
      <StatsCard
        label="Total Revenue"
        value={totalRevenue.toFixed(2)}
        prefix="$"
        icon={<DollarSign className="w-5 h-5" />}
        trend={revenueGrowth * 100}
        trendLabel="vs last period"
        variant="success"
      />
      <StatsCard
        label="Average Rating"
        value={averageRating.toFixed(1)}
        icon={<Star className="w-5 h-5" />}
        variant="warning"
      />
      <StatsCard
        label="Conversion Rate"
        value={(conversionRate * 100).toFixed(1)}
        suffix="%"
        icon={<Users className="w-5 h-5" />}
        variant="primary"
      />
    </div>
  );
}
