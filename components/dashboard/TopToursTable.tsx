'use client';

import { DataTable } from '@/components/ui/DataTable';

interface Tour {
  tourId: string;
  tourTitle: string;
  bookings: number;
  revenue: number;
}

interface TopToursTableProps {
  tours: Tour[];
}

const columns = [
  {
    key: 'tourTitle',
    header: 'Tour',
    render: (tour: Tour) => (
      <span className="font-medium" style={{ color: 'var(--color-text-heading)' }}>
        {tour.tourTitle}
      </span>
    ),
  },
  {
    key: 'bookings',
    header: 'Bookings',
    render: (tour: Tour) => tour.bookings,
  },
  {
    key: 'revenue',
    header: 'Revenue',
    align: 'right' as const,
    render: (tour: Tour) => (
      <span className="font-medium" style={{ color: 'var(--color-text-heading)' }}>
        ${tour.revenue.toFixed(2)}
      </span>
    ),
  },
];

export function TopToursTable({ tours }: TopToursTableProps) {
  return (
    <div>
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--color-text-heading)' }}
      >
        Top Tours
      </h2>
      <DataTable
        columns={columns}
        data={tours}
        keyExtractor={(tour) => tour.tourId}
        emptyMessage="No tour data available yet"
      />
    </div>
  );
}
