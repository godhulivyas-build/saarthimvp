export type NearbyBuyer = {
  id: string;
  name: string;
  typeHi: string;
  typeEn: string;
  cropHi: string;
  cropEn: string;
  pricePerQuintal: number;
  distanceKm: number;
};

export const nearbyBuyers: NearbyBuyer[] = [
  { id: 'b1', name: 'इंदौर ट्रेडर्स', typeHi: 'थोक', typeEn: 'Wholesale', cropHi: 'सोयाबीन', cropEn: 'Soybean', pricePerQuintal: 4650, distanceKm: 10 },
  { id: 'b2', name: 'उज्जैन कलेक्शन', typeHi: 'खुदरा', typeEn: 'Retail', cropHi: 'गेहूं', cropEn: 'Wheat', pricePerQuintal: 2280, distanceKm: 18 },
  { id: 'b3', name: 'Neemuch APMC Agent', typeHi: 'कमीशन', typeEn: 'Commission', cropHi: 'लहसुन', cropEn: 'Garlic', pricePerQuintal: 12500, distanceKm: 25 },
];
