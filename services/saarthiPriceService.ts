import type { Transporter } from './transporterDirectory';
import { matchTransportersForRoute, TransportMatch } from './transportMatching';
import type { BuyerOffer } from './discoveryAgentService';

export type SaarthiPriceResult = {
  buyerOffer: BuyerOffer;
  transportMatch: TransportMatch | null;
  transportCostPerQuintal: number | null;
  netPricePerQuintal: number | null;
  vsGovtPercent: number | null;
  /** Why netPricePerQuintal is null, when it is. Never a fabricated number — just an honest reason. */
  note: string | null;
};

/**
 * The real "Saarthi Price": what a farmer actually nets after paying a real,
 * registered transporter to reach the buyer — not just the buyer's raw quoted
 * rate. Only computed from real registered data:
 *  - if the farmer's quantity is known, any matched transporter's real
 *    estimated trip cost (per_km or per_quintal) can be divided by that real
 *    quantity for an exact per-quintal transport cost;
 *  - if quantity isn't known yet (e.g. a public/home-page lookup before the
 *    farmer has entered anything), only a transporter with an already-flat,
 *    quantity-independent per-quintal rate can be used honestly — a per-km
 *    rate can't be converted to per-quintal without assuming a load size,
 *    and this function never assumes one.
 * When neither is possible, netPricePerQuintal stays null and `note` explains
 * why, rather than showing an invented figure.
 */
export function computeSaarthiPrice(
  buyerOffer: BuyerOffer,
  farmerLoc: { lat: number; lng: number },
  transporters: Transporter[],
  quantityQuintal: number | null,
  govtModal: number | null
): SaarthiPriceResult {
  if (buyerOffer.buyer.lat == null || buyerOffer.buyer.lng == null) {
    return {
      buyerOffer,
      transportMatch: null,
      transportCostPerQuintal: null,
      netPricePerQuintal: null,
      vsGovtPercent: null,
      note: "Buyer's location isn't on file, so transport cost can't be estimated.",
    };
  }

  const buyerLoc = { lat: buyerOffer.buyer.lat, lng: buyerOffer.buyer.lng };
  const matches = matchTransportersForRoute(farmerLoc, buyerLoc, quantityQuintal ?? 1, transporters);

  let chosen: TransportMatch | null = null;
  let transportCostPerQuintal: number | null = null;

  if (quantityQuintal != null && quantityQuintal > 0) {
    chosen = matches.find((m) => m.estimatedCost != null) ?? null;
    if (chosen?.estimatedCost != null) {
      transportCostPerQuintal = chosen.estimatedCost / quantityQuintal;
    }
  } else {
    chosen = matches.find((m) => m.costBasis === 'per_quintal' && m.transporter.pricePerQuintal != null) ?? null;
    if (chosen?.transporter.pricePerQuintal != null) {
      transportCostPerQuintal = chosen.transporter.pricePerQuintal;
    }
  }

  if (transportCostPerQuintal == null) {
    return {
      buyerOffer,
      transportMatch: chosen,
      transportCostPerQuintal: null,
      netPricePerQuintal: null,
      vsGovtPercent: null,
      note:
        quantityQuintal == null
          ? 'Enter your quantity for a transport-inclusive Saarthi Price.'
          : 'No registered transporter found for this route yet.',
    };
  }

  const netPricePerQuintal = Math.round(buyerOffer.offerPricePerQuintal - transportCostPerQuintal);
  const vsGovtPercent =
    govtModal && govtModal > 0 ? Math.round(((netPricePerQuintal - govtModal) / govtModal) * 100) : null;

  return {
    buyerOffer,
    transportMatch: chosen,
    transportCostPerQuintal: Math.round(transportCostPerQuintal),
    netPricePerQuintal,
    vsGovtPercent,
    note: null,
  };
}
