import { MarketRate, CropDiscoveryListing } from "../types";

// Mock service to generate realistic market rates based on location and crop
export const getMarketRates = async (location: string, primaryCrop: string): Promise<MarketRate[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const crops = [primaryCrop || 'Soybean', 'Wheat', 'Gram', 'Onion', 'Garlic'];
  const mandis = [location || 'Local Mandi', 'Indore Mandi', 'Neemuch Mandi', 'Mandsaur Mandi', 'Bhopal APMC'];

  const getRandomTrend = () => {
    const r = Math.random();
    if (r > 0.6) return 'up';
    if (r > 0.3) return 'down';
    return 'stable';
  };

  const results: MarketRate[] = [];

  // Generate a mix of data
  for (let i = 0; i < 5; i++) {
    const isPrimary = i === 0;
    const crop = isPrimary ? (primaryCrop || 'Onion') : crops[i % crops.length];
    const mandi = isPrimary ? (location || 'Local Mandi') : mandis[i % mandis.length];
    
    // Base prices roughly
    const basePrice = crop.toLowerCase().includes('soybean') ? 4800 :
                      crop.toLowerCase().includes('wheat') ? 2275 :
                      crop.toLowerCase().includes('gram') ? 5200 :
                      crop.toLowerCase().includes('garlic') ? 12000 :
                      crop.toLowerCase().includes('onion') ? 2200 : 3000;

    const variation = Math.floor(Math.random() * 400) - 200;
    const price = basePrice + variation;
    const msp = basePrice - 500;
    const trend = getRandomTrend();
    const change = parseFloat((Math.random() * 5).toFixed(1));

    results.push({
      id: `m-${i}`,
      crop,
      mandi,
      price,
      msp,
      trend: trend as 'up' | 'down' | 'stable',
      change
    });
  }

  return results;
};

export const getDiscoveryListings = async (crop: string): Promise<CropDiscoveryListing[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  // Base listings
  const baseData = [
    { mandi: 'Indore Mandi', state: 'Madhya Pradesh', dist: 25, price: 2100 },
    { mandi: 'Neemuch Mandi', state: 'Madhya Pradesh', dist: 90, price: 2350 },
    { mandi: 'Mandsaur Mandi', state: 'Madhya Pradesh', dist: 110, price: 1800 },
    { mandi: 'Bhopal APMC', state: 'Madhya Pradesh', dist: 190, price: 1950 },
    { mandi: 'Local Farm Aggregator', state: 'Nearby', dist: 12, price: 2200 },
  ];

  const results: CropDiscoveryListing[] = baseData.map((item, idx) => {
    // Calculate simple logistics cost estimate (e.g., 5 rs per km per ton base + fixed)
    const logCost = Math.round((item.dist * 6) + 500);
    const eta = Math.ceil(item.dist / 40) + 2; // rough hours

    const tags: ('Cheapest' | 'Fastest' | 'Best Value')[] = [];
    
    // Logic for tags will be applied after generation, but let's pre-seed based on knowns
    if (item.mandi.includes('Mandsaur')) tags.push('Cheapest');
    if (item.mandi.includes('Local')) tags.push('Fastest');
    if (item.mandi.includes('Neemuch')) tags.push('Best Value');

    return {
      id: `d-${idx}`,
      crop: crop || 'Onion',
      mandi: item.mandi,
      state: item.state,
      pricePerQuintal: item.price,
      quantityAvailable: Math.floor(Math.random() * 50) + 10,
      distanceKm: item.dist,
      etaHours: eta,
      logisticsCostEst: logCost,
      tags: tags
    };
  });

  return results;
};