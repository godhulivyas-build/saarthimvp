import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY, mapsEnabled } from './maps/googleMapsConfig';

/**
 * Real business discovery via Google Places API — used to find restaurants,
 * dhabas, and transport/logistics businesses near a farmer. This returns
 * genuinely real names/locations/ratings from Google, but NEVER a produce
 * buying price or transport rate — no public source has that per-business.
 * Pair with self-registered data (buyerDirectory / transporterDirectory) for
 * pricing; use this purely for "who's actually here, nearby."
 *
 * Uses the modern google.maps.places.Place.searchNearby — the legacy
 * PlacesService.nearbySearch is not available to Places API accounts created
 * after March 1, 2025.
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

let optionsSet = false;
let placesLibraryPromise: Promise<google.maps.PlacesLibrary> | null = null;

async function getPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (!optionsSet) {
    setOptions({ key: GOOGLE_MAPS_API_KEY, v: 'weekly' });
    optionsSet = true;
  }
  if (!placesLibraryPromise) {
    placesLibraryPromise = importLibrary('places');
  }
  return placesLibraryPromise;
}

export async function findNearbyPlaces(
  location: { lat: number; lng: number },
  options: { includedType?: string; radiusMeters?: number } = {}
): Promise<DiscoveredPlace[]> {
  if (!mapsEnabled()) return [];
  try {
    const { Place } = await getPlacesLibrary();
    const { places } = await Place.searchNearby({
      locationRestriction: { center: location, radius: options.radiusMeters ?? 15000 },
      includedPrimaryTypes: options.includedType ? [options.includedType] : undefined,
      fields: ['id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount', 'regularOpeningHours'],
      maxResultCount: 10,
    });

    return places
      .filter((p) => p.location)
      .map((p) => ({
        placeId: p.id ?? '',
        name: p.displayName ?? 'Unknown',
        address: p.formattedAddress ?? '',
        lat: p.location!.lat(),
        lng: p.location!.lng(),
        rating: p.rating ?? null,
        userRatingsTotal: p.userRatingCount ?? null,
        isOpenNow: null, // requires an async isOpen() call per place — skipped to keep search fast
      }));
  } catch (error) {
    console.error('findNearbyPlaces error:', error);
    return [];
  }
}

export async function findNearbyRestaurants(location: { lat: number; lng: number }): Promise<DiscoveredPlace[]> {
  return findNearbyPlaces(location, { includedType: 'restaurant' });
}

export async function findNearbyTransportBusinesses(location: { lat: number; lng: number }): Promise<DiscoveredPlace[]> {
  return findNearbyPlaces(location, { includedType: 'moving_company' });
}
