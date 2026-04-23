/** Lat/lng used by Google Maps, OSRM, and Leaflet. */
export type LatLng = { lat: number; lng: number };

export type DrivingRouteResult = {
  path: LatLng[];
  distanceKm: number;
  durationMin: number;
};

export function buildGoogleMapsDirUrl(origin: LatLng, destination: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
}

/** Uses Directions Service (enable “Directions API” in Google Cloud for this key). */
export function fetchGoogleDrivingRoute(origin: LatLng, destination: LatLng): Promise<DrivingRouteResult | null> {
  const g = typeof window !== 'undefined' ? window.google : undefined;
  if (!g?.maps?.DirectionsService) return Promise.resolve(null);

  return new Promise((resolve) => {
    const svc = new g.maps.DirectionsService();
    svc.route(
      {
        origin,
        destination,
        travelMode: g.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status !== g.maps.DirectionsStatus.OK || !result?.routes?.[0]) {
          resolve(null);
          return;
        }
        const route = result.routes[0];
        const overview = route.overview_path || [];
        const path = overview.map((p) => ({ lat: p.lat(), lng: p.lng() }));
        const leg = route.legs?.[0];
        const distanceKm = (leg?.distance?.value ?? 0) / 1000;
        const durationMin = (leg?.duration?.value ?? 0) / 60;
        resolve({ path, distanceKm, durationMin });
      }
    );
  });
}

/**
 * Free routing using the public OSRM demo server (rate-limited; fine for demos).
 * https://project-osrm.org/
 */
export async function fetchOsrmDrivingRoute(origin: LatLng, destination: LatLng): Promise<DrivingRouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: Array<{ distance?: number; duration?: number; geometry?: { coordinates?: number[][] } }>;
    };
    const r = data.routes?.[0];
    const coords = r?.geometry?.coordinates;
    if (!coords?.length) return null;
    const path = coords.map((c) => ({ lat: c[1], lng: c[0] }));
    return {
      path,
      distanceKm: (r.distance ?? 0) / 1000,
      durationMin: (r.duration ?? 0) / 60,
    };
  } catch {
    return null;
  }
}
