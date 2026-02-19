'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER_BY_ID } from '@/graphql/users';
import { GET_BOOKINGS_BY_USER } from '@/graphql/bookings';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

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

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
};

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
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (userError || !tourist) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {userError ? `Error loading tourist: ${userError.message}` : 'Tourist not found'}
        </div>
      </div>
    );
  }

  const avatarUrl = tourist.media?.[0]?.url;

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tourist Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={tourist.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold text-center mb-1">{tourist.fullName}</h2>
            {tourist.username && (
              <p className="text-gray-500 text-sm text-center mb-4">@{tourist.username}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{tourist.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Joined {format(new Date(tourist.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Total Bookings</span>
                </div>
                <span className="font-semibold">{totalBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Total Spent</span>
                </div>
                <span className="font-semibold">${totalSpent.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Booking History</h2>

            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking: Booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.tourReservation?.tour?.title || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.createdAt
                              ? format(new Date(booking.createdAt), 'MMM dd, yyyy')
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.payment?.amount != null
                              ? `$${booking.payment.amount.toFixed(2)}`
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              statusStyles[booking.status?.toUpperCase()] ||
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.status || 'UNKNOWN'}
                          </span>
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
