import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Search, MapPin, Package, Clock, CheckCircle } from 'lucide-react';
import { Shipment } from '../../types';

interface TrackingViewProps {
  activeShipments: Shipment[];
}

export const TrackingView: React.FC<TrackingViewProps> = ({ activeShipments }) => {
  const [trackId, setTrackId] = useState('');
  const [result, setResult] = useState<Shipment | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = activeShipments.find(s => s.id === trackId || s.id === `SA-${trackId}`);
    // For demo, if not found in active, create a dummy historical one or show not found
    if (found) {
      setResult(found);
    } else {
        // Create a mock result for demonstration if user types random stuff
        if(trackId.length > 3) {
             setResult({
                id: trackId.startsWith('SA-') ? trackId : `SA-${trackId}`,
                source: 'Indore',
                destination: 'Bhopal',
                crop: 'Soybean',
                weight: '10 Tons',
                status: 'In Transit',
                date: '2023-10-25',
                cost: 12000,
                eta: '2 Days'
             });
        } else {
            setResult(null);
        }
    }
  };

  const getStepStatus = (currentStatus: string, stepStatus: string) => {
    const statuses = ['Booked', 'Picked Up', 'In Transit', 'Delivered'];
    const currentIdx = statuses.indexOf(currentStatus);
    const stepIdx = statuses.indexOf(stepStatus);
    
    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="text-blue-600" /> Track Shipment
      </h2>

      <form onSubmit={handleTrack} className="flex gap-2 mb-8">
        <div className="flex-1">
            <Input 
                placeholder="Enter Shipment ID (e.g., SA-2041)" 
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="mb-0" // override default margin
            />
        </div>
        <Button type="submit" className="h-[42px] mt-0">
            <Search size={20} />
        </Button>
      </form>

      {result ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
             <div>
                <p className="text-sm text-blue-600 font-bold">SHIPMENT ID</p>
                <p className="text-lg font-mono font-bold text-gray-900">{result.id}</p>
             </div>
             <div className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-blue-700 shadow-sm">
                {result.status}
             </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between mb-8">
                <div>
                    <p className="text-xs text-gray-400 uppercase">From</p>
                    <p className="font-bold text-gray-800">{result.source}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase">To</p>
                    <p className="font-bold text-gray-800">{result.destination}</p>
                </div>
            </div>

            <div className="relative flex justify-between items-center mb-6">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                
                {['Booked', 'Picked Up', 'In Transit', 'Delivered'].map((step, idx) => {
                    const status = getStepStatus(result.status, step);
                    let colorClass = "bg-gray-200 text-gray-400 border-gray-200";
                    if (status === 'completed') colorClass = "bg-green-500 text-white border-green-500";
                    if (status === 'active') colorClass = "bg-white border-blue-500 text-blue-500 ring-4 ring-blue-100";

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${colorClass}`}>
                                {status === 'completed' ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                            </div>
                            <p className="absolute top-10 text-[10px] font-medium text-gray-500 w-20 text-center uppercase tracking-wide">{step}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 bg-gray-50 p-4 rounded-lg">
                <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Package size={12}/> Content</p>
                    <p className="font-medium">{result.weight} {result.crop}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> ETA</p>
                    <p className="font-medium">{result.eta}</p>
                </div>
            </div>
          </div>
        </div>
      ) : (
         trackId.length > 0 && <div className="text-center p-8 text-gray-400">Shipment not found. Please check ID.</div>
      )}
    </div>
  );
};