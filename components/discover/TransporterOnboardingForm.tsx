import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../v2/ui/Card';
import { VEHICLE_TYPE_LABEL, VehicleType, registerTransporter } from '../../services/transporterDirectory';
import { MP_DISTRICTS } from '../../config/mpLocations';

type Props = {
  onClose: () => void;
  onRegistered: () => void;
};

export const TransporterOnboardingForm: React.FC<Props> = ({ onClose, onRegistered }) => {
  const { lang } = useI18n();
  const isHi = lang !== 'en';
  const tt = (en: string, hi: string) => (isHi ? hi : en);

  const [driverName, setDriverName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('mini_truck');
  const [capacityQuintal, setCapacityQuintal] = useState('');
  const [priceMode, setPriceMode] = useState<'per_km' | 'per_quintal'>('per_km');
  const [priceValue, setPriceValue] = useState('');
  const [districtName, setDistrictName] = useState(MP_DISTRICTS[0].name);
  const [villageOrArea, setVillageOrArea] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!driverName.trim() || !contactPhone.trim() || !capacityQuintal || !priceValue) {
      setError(
        tt(
          'Please fill your name, phone, vehicle capacity, and price.',
          'कृपया अपना नाम, फ़ोन, गाड़ी की क्षमता, और भाव भरें।'
        )
      );
      return;
    }

    setSaving(true);
    try {
      const district = MP_DISTRICTS.find((d) => d.name === districtName)!;
      await registerTransporter({
        driverName: driverName.trim(),
        vehicleType,
        capacityQuintal: Number(capacityQuintal),
        pricePerKm: priceMode === 'per_km' ? Number(priceValue) : null,
        pricePerQuintal: priceMode === 'per_quintal' ? Number(priceValue) : null,
        state: 'Madhya Pradesh',
        district: district.name,
        villageOrArea: villageOrArea.trim() || undefined,
        lat: district.lat,
        lng: district.lng,
        contactPhone: contactPhone.trim(),
      });
      setDone(true);
      onRegistered();
    } catch (e: any) {
      setError(e?.message || tt('Could not save. Please try again.', 'सेव नहीं हो सका। फिर कोशिश करें।'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[var(--sarthi-on-background)]">
            {tt('Register as a transporter', 'ट्रांसपोर्टर के रूप में पंजीकरण करें')}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--sarthi-surface-low)]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">✅</div>
            <p className="font-bold text-[var(--sarthi-primary)]">
              {tt('Registered! Farmers and buyers can now find you.', 'पंजीकृत! अब किसान और खरीदार आपको खोज सकते हैं।')}
            </p>
            <button onClick={onClose} className="mt-2 px-6 py-2 rounded-xl bg-[var(--sarthi-primary)] text-white font-bold">
              {tt('Done', 'ठीक है')}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {tt(
                'Truck, tractor, pickup, or auto owners can list themselves here — free.',
                'ट्रक, ट्रैक्टर, पिकअप या ऑटो मालिक यहां मुफ़्त में सूचीबद्ध हो सकते हैं।'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Your name', 'आपका नाम')}</label>
                <input value={driverName} onChange={(e) => setDriverName(e.target.value)} className="sarthi-input" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Vehicle type', 'गाड़ी का प्रकार')}</label>
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)} className="sarthi-input cursor-pointer">
                  {Object.entries(VEHICLE_TYPE_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>
                      {isHi ? label.hi : label.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Capacity (quintal)', 'क्षमता (क्विंटल)')}</label>
                <input type="number" value={capacityQuintal} onChange={(e) => setCapacityQuintal(e.target.value)} className="sarthi-input" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('District', 'ज़िला')}</label>
                <select value={districtName} onChange={(e) => setDistrictName(e.target.value)} className="sarthi-input cursor-pointer">
                  {MP_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {isHi ? d.nameHi : d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Area (optional)', 'क्षेत्र (वैकल्पिक)')}</label>
                <input value={villageOrArea} onChange={(e) => setVillageOrArea(e.target.value)} className="sarthi-input" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Phone number', 'फ़ोन नंबर')}</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="sarthi-input" placeholder="+91" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">{tt('How do you price a trip?', 'आप भाव कैसे तय करते हैं?')}</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPriceMode('per_km')}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${priceMode === 'per_km' ? 'bg-[var(--sarthi-primary)] text-white border-[var(--sarthi-primary)]' : 'border-[var(--sarthi-outline-soft)] text-gray-600'}`}
                >
                  {tt('Per km', 'प्रति किमी')}
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode('per_quintal')}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${priceMode === 'per_quintal' ? 'bg-[var(--sarthi-primary)] text-white border-[var(--sarthi-primary)]' : 'border-[var(--sarthi-outline-soft)] text-gray-600'}`}
                >
                  {tt('Per quintal', 'प्रति क्विंटल')}
                </button>
              </div>
              <input
                type="number"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                placeholder={priceMode === 'per_km' ? '₹/km' : '₹/quintal'}
                className="sarthi-input"
              />
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[var(--sarthi-primary)] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {tt('Register my vehicle', 'अपनी गाड़ी पंजीकृत करें')}
            </button>
          </>
        )}
      </Card>
    </div>
  );
};
