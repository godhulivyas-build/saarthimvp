/**
 * Real nearby-business discovery via OpenStreetMap's Overpass API — free,
 * no API key, no billing account needed. Used as the primary discovery
 * source instead of Google Places (which requires a working billing setup).
 *
 * Trade-off vs. Google Places: no star ratings/review counts (OSM doesn't
 * track those), and rural-India coverage for small businesses is patchier
 * than Google's — but names, locations, and types are genuinely real,
 * sourced from actual community-mapped data. Never fabricates a price.
 *
 * Overpass has a fair-use policy for the public instance (overpass-api.de) —
 * fine for an app at our current scale; a self-hosted or paid Overpass
 * instance would be the next step at real production volume.
 */
export type DiscoveredPlace = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  userRatingsTotal: number | null;
  isOpenNow: boolean | null;
};

// The free public Overpass instances are shared, best-effort infrastructure —
// any single one can be slow or return a gateway timeout under load. Try a
// short list of mirrors in order rather than depending on just one.
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

function parseOverpassResponse(data: any): DiscoveredPlace[] {
  const elements: any[] = data.elements ?? [];
  return elements
    .filter((el) => el.tags?.name)
    .map((el): DiscoveredPlace | null => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (lat == null || lng == null) return null;

      const addressParts = [
        el.tags['addr:housenumber'],
        el.tags['addr:street'],
        el.tags['addr:suburb'] || el.tags['addr:village'] || el.tags['addr:city'],
      ].filter(Boolean);

      return {
        placeId: `osm-${el.type}-${el.id}`,
        name: el.tags.name,
        address: addressParts.join(', '),
        lat,
        lng,
        rating: null,
        userRatingsTotal: null,
        isOpenNow: null,
      };
    })
    .filter((p): p is DiscoveredPlace => p !== null)
    .slice(0, 15);
}

async function runOverpassQuery(query: string): Promise<DiscoveredPlace[]> {
  for (const url of OVERPASS_MIRRORS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        console.error(`Overpass mirror ${url} error:`, res.status);
        continue; // try the next mirror
      }
      const data = await res.json();
      return parseOverpassResponse(data);
    } catch (error) {
      console.error(`Overpass mirror ${url} failed:`, error);
      // fall through to the next mirror
    }
  }
  return [];
}

export async function findNearbyRestaurants(
  location: { lat: number; lng: number },
  radiusMeters = 10000
): Promise<DiscoveredPlace[]> {
  const { lat, lng } = location;
  const query = `[out:json][timeout:10];
(
  node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
  node["amenity"="fast_food"](around:${radiusMeters},${lat},${lng});
  way["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
);
out center 15;`;
  return runOverpassQuery(query);
}

export async function findNearbyTransportBusinesses(
  location: { lat: number; lng: number },
  radiusMeters = 5000
): Promise<DiscoveredPlace[]> {
  const { lat, lng } = location;
  // Structured tag lookup only, small radius — fuel stations are a dense tag
  // worldwide and an around-query for them at 10km+ was timing out on the
  // shared public Overpass servers. Used as a proxy for "transport hub
  // nearby" since OSM has no single clean tag for "trucking company."
  const query = `[out:json][timeout:10];
(
  node["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
);
out center 10;`;
  return runOverpassQuery(query);
}
