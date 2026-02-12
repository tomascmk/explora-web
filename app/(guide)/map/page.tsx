'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@apollo/client/react';
import { GET_TOURS_BY_GUIDE } from '@/graphql/tours';

// Import map dynamically to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap').then((mod) => mod.InteractiveMap),
  { ssr: false }
);

interface Tour {
  id: string;
  title: string;
  price: number;
  rating: number;
  tourSteps: Array<{
    latitude: number;
    longitude: number;
  }>;
}

export default function MapPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data, loading } = useQuery<{ toursByGuide: Tour[] }>(GET_TOURS_BY_GUIDE, {
    variables: { guideId: user?.id },
    skip: !user
  });

  // Transform tours to include first step coordinates
  const tours = (data?.toursByGuide || []).map(tour => ({
    id: tour.id,
    title: tour.title,
    latitude: tour.tourSteps?.[0]?.latitude || 0,
    longitude: tour.tourSteps?.[0]?.longitude || 0,
    price: tour.price,
    rating: tour.rating
  })).filter(tour => tour.latitude && tour.longitude);

  const handleTourClick = (tourId: string) => {
    router.push(`/tours/${tourId}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mapa de Tours</h1>
        <p className="text-gray-600">
          Visualiza la ubicación de todos tus tours en el mapa ({tours.length} tours)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Tours Activos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Tours Inactivos</span>
          </div>
        </div>

        <InteractiveMap
          tours={tours}
          center={[40.7128, -74.0060]}
          zoom={12}
          onTourClick={handleTourClick}
        />
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tip</h3>
        <p className="text-sm text-blue-800">
          Haz clic en los marcadores para ver detalles de cada tour. Los marcadores cercanos se agrupan automáticamente para mejor visualización.
        </p>
      </div>
    </div>
  );
}
