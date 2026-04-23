import React, { useEffect, useState } from 'react';
import { MarketRate, UserPreferences } from '../../types';
import { getMarketRates } from '../../services/marketService';
import { TrendingUp, TrendingDown, Minus, MapPin, IndianRupee, Loader2 } from 'lucide-react';

interface MarketRatesViewProps {
  preferences: UserPreferences | null;
}

export const MarketRatesView: React.FC<MarketRatesViewProps> = ({ preferences }) => {
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      const data = await getMarketRates(preferences?.location || 'Indore', preferences?.primaryCrop || 'Soybean');
      setRates(data);
      setLoading(false);
    };
    fetchRates();
  }, [preferences]);

  return (
    <div className="p-4">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <TrendingUp size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Mandi Rates</h2>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            Live Updates
          </div>
       </div>

       {loading ? (
         <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Fetching latest prices from mandis...</p>
         </div>
       ) : (
         <div className="space-y-4">
            {rates.map((rate) => (
                <div key={rate.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                    {/* Status Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${rate.trend === 'up' ? 'bg-green-500' : rate.trend === 'down' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                    
                    <div className="flex justify-between items-start mb-3 pl-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{rate.crop}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin size={12} /> {rate.mandi}
                            </p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                            rate.trend === 'up' ? 'bg-green-100 text-green-700' : 
                            rate.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {rate.trend === 'up' && <TrendingUp size={14} />}
                            {rate.trend === 'down' && <TrendingDown size={14} />}
                            {rate.trend === 'stable' && <Minus size={14} />}
                            {rate.change}%
                        </div>
                    </div>

                    <div className="flex items-end justify-between pl-2">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Market Price</p>
                            <div className="flex items-center text-2xl font-bold text-gray-800">
                                <IndianRupee size={20} /> {rate.price.toLocaleString()} <span className="text-sm text-gray-500 font-normal ml-1">/qtl</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Govt MSP</p>
                            <p className="text-sm font-medium text-gray-600">₹{rate.msp}</p>
                        </div>
                    </div>
                </div>
            ))}
         </div>
       )}
    </div>
  );
};