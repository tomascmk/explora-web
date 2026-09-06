'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@apollo/client/react';
import { GET_TOURS_BY_GUIDE } from '@/graphql/tours';
import { PageHeader } from '@/components/ui/PageHeader';

// Import map dynamically to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap').then((mod) => mod.InteractiveMap),
  { ssr: false }
);

/**
 * PLAN-122 — `Tour` no tiene `price` ni `rating` en el esquema.
 *
 * Esta interfaz los declaraba igual y `useQuery<{ toursByGuide: Tour[] }>` se lo
 * creía, así que TypeScript no veía nada: la query nunca los pedía y el popup
 * del mapa venía mostrando `Precio: $undefined`. El precio vive en
 * `tourPricings`, que la query sí trae.
 */
interface Tour {
  id: string;
  title: string;
  tourPricings?: Array<{
    price: number;
    currency: string;
    createdAt?: string;
  }> | null;
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
  const tours = (data?.toursByGuide || []).map(tour => {
    // El mismo criterio que usa el cobro (`TourQuoteService` en la API): el
    // pricing más antiguo. `tourPricings` es un OneToMany sin ORDER BY.
    const pricing = [...(tour.tourPricings ?? [])].sort(
      (a, b) =>
        new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
    )[0];
    return {
      id: tour.id,
      title: tour.title,
      latitude: tour.tourSteps?.[0]?.latitude || 0,
      longitude: tour.tourSteps?.[0]?.longitude || 0,
      price: Number(pricing?.price ?? 0),
      currency: pricing?.currency ?? null
    };
  }).filter(tour => tour.latitude && tour.longitude);

  const handleTourClick = (tourId: string) => {
    router.push(`/tours/${tourId}/edit`);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 rounded w-1/4 mb-4" style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
        <div className="h-96 rounded" style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Mapa de Tours"
        subtitle={`Visualiza la ubicacion de todos tus tours en el mapa (${tours.length} tours)`}
      />

      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
      >
        <div className="mb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>Tours Activos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--color-text-muted)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>Tours Inactivos</span>
          </div>
        </div>

        <InteractiveMap
          tours={tours}
          center={[40.7128, -74.0060]}
          zoom={12}
          onTourClick={handleTourClick}
        />
      </div>

      <div
        className="mt-6 rounded-xl border p-4"
        style={{ backgroundColor: 'var(--color-info-light)', borderColor: 'var(--color-info)' }}
      >
        <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-heading)' }}>Tip</h3>
        <p className="text-sm" style={{ color: 'var(--color-info)' }}>
          Haz clic en los marcadores para ver detalles de cada tour. Los marcadores cercanos se agrupan automaticamente para mejor visualizacion.
        </p>
      </div>
    </div>
  );
}
