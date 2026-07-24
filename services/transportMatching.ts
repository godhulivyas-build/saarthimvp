import { Transporter } from './transporterDirectory';

export type LatLng = { lat: number; lng: number };

export type TransportMatch = {
  transporter: Transporter;
  pickupDistanceKm: number; // transporter's base -> farmer
  deliveryDistanceKm: number; // farmer -> buyer
  totalDistanceKm: number;
  estimatedCost: number | null;
  costBasis: 'per_km' | 'per_quintal' | null;
  capacitySufficient: boolean;
};

function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Match transporters to a farm -> buyer route. A transporter's own base location
 * determines their pickup leg (how far they have to travel to reach the farmer);
 * the farm -> buyer leg is the same for everyone and is the actual delivery.
 *
 * Sorted: transporters who can carry the full quantity in one trip first, then by
 * estimated cost (cheapest first), then by how far they have to travel to pick up.
 */
export function matchTransportersForRoute(
  farmerLoc: LatLng,
  buyerLoc: LatLng,
  quantityQuintal: number,
  transporters: Transporter[]
): TransportMatch[] {
  const deliveryDistanceKm = distanceKm(farmerLoc, buyerLoc);

  const matches: TransportMatch[] = transporters
    .filter((t) => t.lat != null && t.lng != null)
    .map((t) => {
      const pickupDistanceKm = distanceKm({ lat: t.lat!, lng: t.lng! }, farmerLoc);
      const totalDistanceKm = pickupDistanceKm + deliveryDistanceKm;

      let estimatedCost: number | null = null;
      let costBasis: 'per_km' | 'per_quintal' | null = null;
      if (t.pricePerQuintal != null) {
        estimatedCost = Math.round(t.pricePerQuintal * quantityQuintal);
        costBasis = 'per_quintal';
      } else if (t.pricePerKm != null) {
        estimatedCost = Math.round(t.pricePerKm * totalDistanceKm);
        costBasis = 'per_km';
      }

      return {
        transporter: t,
        pickupDistanceKm,
        deliveryDistanceKm,
        totalDistanceKm,
        estimatedCost,
        costBasis,
        capacitySufficient: t.capacityQuintal >= quantityQuintal,
      };
    })
    .sort((a, b) => {
      if (a.capacitySufficient !== b.capacitySufficient) return a.capacitySufficient ? -1 : 1;
      if (a.estimatedCost != null && b.estimatedCost != null) return a.estimatedCost - b.estimatedCost;
      if (a.estimatedCost != null) return -1;
      if (b.estimatedCost != null) return 1;
      return a.pickupDistanceKm - b.pickupDistanceKm;
    });

  return matches;
}
