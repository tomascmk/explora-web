'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER_BY_ID } from '@/graphql/users';
import { GET_BOOKINGS_BY_USER } from '@/graphql/bookings';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface UserMedia {
  id: string;
  url: string;
  type: string;
}

interface UserData {
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    createdAt: string;
    media: UserMedia[];
  };
}

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  payment: {
    id: string;
    amount: number;
    status: string;
  } | null;
  tourReservation: {
    id: string;
    tour: {
      id: string;
      title: string;
    } | null;
  } | null;
}

interface BookingsData {
  getBookingsByUser: Booking[];
}

export default function TouristDetailPage() {
  const params = useParams();
  const router = useRouter();
  const touristId = params.id as string;

  const { data: userData, loading: userLoading, error: userError } = useQuery<UserData>(
    GET_USER_BY_ID,
    { variables: { id: touristId } }
  );

  const { data: bookingsData, loading: bookingsLoading } = useQuery<BookingsData>(
    GET_BOOKINGS_BY_USER,
    { variables: { userId: touristId } }
  );

  const tourist = userData?.user;
  const bookings = bookingsData?.getBookingsByUser || [];
  const isLoading = userLoading || bookingsLoading;

  // Compute stats from bookings
  const totalBookings = bookings.length;
  const totalSpent = bookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  if (userError || !tourist) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:opacity-80 mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="border px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-danger-light)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
          {userError ? `Error loading tourist: ${userError.message}` : 'Tourist not found'}
        </div>
      </div>
    );
  }

  const avatarUrl = tourist.media?.[0]?.url;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 hover:opacity-80 mb-6"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tourist Info */}
        <div className="lg:col-span-1 space-y-6">
          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <div className="flex items-center justify-center mb-4">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatar from arbitrary OAuth provider URLs; next/image would require enumerating all hosts
                <img
                  src={avatarUrl}
                  alt={tourist.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  <User className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold text-center mb-1" style={{ color: 'var(--color-text-heading)' }}>{tourist.fullName}</h2>
            {tourist.username && (
              <p className="text-sm text-center mb-4" style={{ color: 'var(--color-text-muted)' }}>@{tourist.username}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text-body)' }}>{tourist.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text-body)' }}>
                  Joined {format(new Date(tourist.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-heading)' }}>Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ color: 'var(--color-text-body)' }}>Total Bookings</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{totalBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ color: 'var(--color-text-body)' }}>Total Spent</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>${totalSpent.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="lg:col-span-2">
          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-heading)' }}>Booking History</h2>

            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--color-card-border)' }}>
                  <thead style={{ backgroundColor: 'var(--color-section-bg)' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>
                        Tour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--color-card-border)' }}>
                    {bookings.map((booking: Booking) => (
                      <tr key={booking.id} className="hover:opacity-90 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-heading)' }}>
                            {booking.tourReservation?.tour?.title || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--color-text-heading)' }}>
                            {booking.createdAt
                              ? format(new Date(booking.createdAt), 'MMM dd, yyyy')
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--color-text-heading)' }}>
                            {booking.payment?.amount != null
                              ? `$${booking.payment.amount.toFixed(2)}`
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={booking.status || 'UNKNOWN'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
