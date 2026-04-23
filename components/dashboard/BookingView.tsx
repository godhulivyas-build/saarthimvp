import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { generateTransportOptions } from '../../services/geminiService';
import { TransportOption, Shipment } from '../../types';
import { Loader2, Truck, IndianRupee, Clock, Star, MapPin, CheckCircle } from 'lucide-react';

interface BookingViewProps {
  onBook: (shipment: Shipment) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ onBook }) => {
  const [step, setStep] = useState<'form' | 'options' | 'confirm'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    crop: '',
    weight: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<TransportOption | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const results = await generateTransportOptions(formData.source, formData.destination, formData.crop, formData.weight);
    setOptions(results);
    setLoading(false);
    setStep('options');
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    
    const newShipment: Shipment = {
      id: `SA-${Math.floor(1000 + Math.random() * 9000)}`,
      source: formData.source,
      destination: formData.destination,
      crop: formData.crop,
      weight: formData.weight,
      status: 'Booked',
      date: formData.date,
      cost: selectedOption.price,
      eta: selectedOption.eta
    };
    
    onBook(newShipment);
    setStep('confirm');
  };

  if (step === 'form') {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Truck className="text-green-600" /> Book Transport
        </h2>
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Source Location" 
              placeholder="e.g. Indore Mandi"
              value={formData.source}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              required
            />
            <Input 
              label="Destination" 
              placeholder="e.g. Bhopal APMC"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Crop Type" 
              placeholder="Onion"
              value={formData.crop}
              onChange={(e) => setFormData({...formData, crop: e.target.value})}
              required
            />
            <Input 
              label="Weight (Tons/Kg)" 
              placeholder="5 Tons"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              required
            />
          </div>
          <Input 
            label="Pickup Date" 
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Finding Vehicles...</span> : "Find Transporters"}
          </Button>
        </form>
      </div>
    );
  }

  if (step === 'options') {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Select Vehicle</h2>
          <button onClick={() => setStep('form')} className="text-sm text-gray-500 hover:text-gray-800">Back</button>
        </div>
        
        {options.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No transporters found for this route. Try different locations.</div>
        ) : (
          <div className="space-y-4">
            {options.map((opt) => (
              <div 
                key={opt.id}
                onClick={() => setSelectedOption(opt)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedOption?.id === opt.id ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 bg-white hover:border-green-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{opt.provider}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Truck size={14} /> {opt.vehicleType}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-bold text-green-700 flex items-center justify-end">
                       <IndianRupee size={16} /> {opt.price}
                    </span>
                    <span className="text-xs text-gray-400">Fixed Price</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-2 mt-2">
                  <span className="flex items-center gap-1"><Clock size={14} className="text-orange-500"/> {opt.eta}</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500"/> {opt.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Button 
            fullWidth 
            disabled={!selectedOption} 
            onClick={handleConfirm}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center h-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-8 max-w-xs mx-auto">
          Your shipment of <strong>{formData.crop}</strong> is scheduled for pickup.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg w-full max-w-sm mb-6 text-left">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipment ID</p>
          <p className="font-mono text-lg font-bold text-gray-900">SA-{Math.floor(1000 + Math.random() * 9000)}</p>
        </div>
        <Button onClick={() => setStep('form')} variant="outline">Book Another</Button>
      </div>
    );
  }

  return null;
};