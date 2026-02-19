/**
 * OSRM (Open Source Routing Machine) walking route utility for web (Leaflet).
 * Uses the public OSRM server to get real street-level walking routes.
 * Returns [lat, lng] tuples compatible with Leaflet Polyline.
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/foot'

interface Waypoint {
  latitude: number
  longitude: number
}

/**
 * Fetches a walking route between multiple waypoints using OSRM.
 * Returns an array of [lat, lng] tuples for Leaflet Polyline.
 * Falls back to straight lines between waypoints if the API call fails.
 *
 * @param waypoints - Array of {latitude, longitude} coordinates
 * @returns Array of [lat, lng] tuples forming the walking route
 */
export async function getWalkingRoute(
  waypoints: Waypoint[]
): Promise<[number, number][]> {
  if (waypoints.length < 2) {
    return waypoints.map((w) => [w.latitude, w.longitude] as [number, number])
  }

  // OSRM format: lon,lat;lon,lat (note: longitude FIRST)
  const coords = waypoints
    .map((w) => `${w.longitude},${w.latitude}`)
    .join(';')

  const url = `${OSRM_BASE_URL}/${coords}?overview=full&geometries=geojson`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates) {
      console.warn('OSRM route failed, falling back to straight lines:', data.code)
      return waypoints.map((w) => [w.latitude, w.longitude] as [number, number])
    }

    // GeoJSON coordinates are [lon, lat], convert to [lat, lng] for Leaflet
    const routeCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon] as [number, number]
    )

    return routeCoords
  } catch (error) {
    console.error('OSRM fetch error:', error)
    return waypoints.map((w) => [w.latitude, w.longitude] as [number, number])
  }
}
