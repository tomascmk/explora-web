'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

interface Tour {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  rating?: number;
}

interface InteractiveMapProps {
  tours: Tour[];
  center?: [number, number];
  zoom?: number;
  onTourClick?: (tourId: string) => void;
}

export function InteractiveMap({
  tours,
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 12,
  onTourClick,
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current);
    }

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    // Custom icon
    const customIcon = L.divIcon({
      html: `
        <div style="
          background-color: #3b82f6;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Add markers for each tour
    tours.forEach((tour) => {
      const marker = L.marker([tour.latitude, tour.longitude], {
        icon: customIcon,
      });

      // Popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">${tour.title}</h3>
          <p style="margin-bottom: 4px;">Precio: $${tour.price}</p>
          ${tour.rating ? `<p style="margin-bottom: 8px;">⭐ ${tour.rating}/5</p>` : ''}
          <button
            onclick="window.dispatchEvent(new CustomEvent('tour-click', { detail: '${tour.id}' }))"
            style="
              background-color: #3b82f6;
              color: white;
              padding: 6px 12px;
              border-radius: 4px;
              border: none;
              cursor: pointer;
              width: 100%;
            "
          >
            Ver Detalles
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markers.addLayer(marker);
    });

    markersRef.current = markers;
    mapRef.current.addLayer(markers);

    // Fit bounds to show all markers
    if (tours.length > 0) {
      const bounds = markers.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [tours]);

  useEffect(() => {
    const handleTourClick = (event: CustomEvent<string>) => {
      if (onTourClick) {
        onTourClick(event.detail);
      }
    };

    window.addEventListener('tour-click', handleTourClick as EventListener);
    return () =>
      window.removeEventListener('tour-click', handleTourClick as EventListener);
  }, [onTourClick]);

  return (
    <div
      ref={mapContainerRef}
      className="relative z-0"
      style={{ width: '100%', height: '600px', borderRadius: '8px' }}
    />
  );
}
