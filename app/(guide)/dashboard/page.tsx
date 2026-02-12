'use client';

import { useQuery } from '@apollo/client/react';
import { GET_GUIDE_ANALYTICS } from '@/graphql/analytics';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { BookingsChart } from '@/components/dashboard/BookingsChart';
import { TopToursTable } from '@/components/dashboard/TopToursTable';
import { DashboardTour } from '@/components/tutorial/DashboardTour';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { subMonths, format } from 'date-fns';

export default function GuideDashboardPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 6),
    endDate: new Date(),
  });

  const { data, loading, error, refetch } = useQuery(GET_GUIDE_ANALYTICS, {
    skip: !user, // Skip si no hay usuario autenticado
    variables: {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    },
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    // Manejo específico para error de autenticación
    if (error.message.includes('Unauthorized') || error.message.includes('UNAUTHENTICATED')) {
      return (
        <div className="p-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p className="font-medium">Sesión expirada</p>
            <p className="text-sm">Por favor inicia sesión de nuevo para ver las analytics</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Ir a Login
            </button>
          </div>
        </div>
      );
    }

    // Para otros errores, mostrar estado vacío con opción de retry
    return (
      <div className="p-8">
        <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded">
          <p className="font-medium text-gray-700">No hay datos disponibles</p>
          <p className="text-sm text-gray-600">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const analytics = (data as any)?.myGuideAnalytics;

  if (!analytics) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay analytics disponibles aún</p>
          <p className="text-sm text-gray-400">Completa algunos tours para ver estadísticas aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <DashboardTour />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const months = parseInt(e.target.value);
              setDateRange({
                startDate: subMonths(new Date(), months),
                endDate: new Date(),
              });
            }}
          >
            <option value="1">Last Month</option>
            <option value="3">Last 3 Months</option>
            <option value="6" selected>Last 6 Months</option>
            <option value="12">Last Year</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mb-8" data-tour="metrics">
        <MetricsCards
          totalBookings={analytics.totalBookings}
          totalRevenue={analytics.totalRevenue}
          averageRating={analytics.averageRating}
          conversionRate={analytics.conversionRate}
          bookingGrowth={analytics.trends.bookingGrowth}
          revenueGrowth={analytics.trends.revenueGrowth}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div data-tour="revenue-chart">
          <RevenueChart data={analytics.revenueByPeriod} />
        </div>
        <div data-tour="bookings-chart">
          <BookingsChart data={analytics.bookingsByPeriod} />
        </div>
      </div>

      {/* Top Tours */}
      <div data-tour="top-tours">
        <TopToursTable tours={analytics.topTours} />
      </div>
    </div>
  );
}
