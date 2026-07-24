import React, { useState } from 'react';
import { Search, Loader2, MapPin, Phone, Navigation2, Handshake, Truck, Star } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../v2/ui/Card';
import { MP_DISTRICTS } from '../../config/mpLocations';
import { VEHICLE_TYPE_LABEL } from '../../services/transporterDirectory';
import { listTransportersForDistrict } from '../../services/transporterDirectory';
import { matchTransportersForRoute, TransportMatch } from '../../services/transportMatching';
import { findNearbyTransportBusinesses, DiscoveredPlace } from '../../services/osmDiscovery';
import { TransporterOnboardingForm } from './TransporterOnboardingForm';

/** Anyone needing to move produce: farmers arranging pickup, buyers arranging delivery. */
export const TransportFlow: React.FC = () => {
  const { lang } = useI18n();
  const isHi = lang !== 'en';
  const tt = (en: string, hi: string) => (isHi ? hi : en);

  const [pickupDistrict, setPickupDistrict] = useState('Dewas');
  const [dropDistrict, setDropDistrict] = useState('Khargone');
  const [quantityQuintal, setQuantityQuintal] = useState('50');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matches, setMatches] = useState<TransportMatch[]>([]);
  const [places, setPlaces] = useState<DiscoveredPlace[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const pickup = MP_DISTRICTS.find((d) => d.name === pickupDistrict) ?? MP_DISTRICTS[0];
      const drop = MP_DISTRICTS.find((d) => d.name === dropDistrict) ?? MP_DISTRICTS[0];
      const qty = Number(quantityQuintal) || 0;

      const [transporters, discovered] = await Promise.all([
        listTransportersForDistrict(), // all districts — a driver based elsewhere may still be closest
        findNearbyTransportBusinesses({ lat: pickup.lat, lng: pickup.lng }),
      ]);

      setMatches(matchTransportersForRoute({ lat: pickup.lat, lng: pickup.lng }, { lat: drop.lat, lng: drop.lng }, qty, transporters));
      setPlaces(discovered);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <p className="text-sm text-gray-500">
          {tt(
            'Moving crop from farm to buyer? Find registered drivers, sorted by who can actually carry your load and what it will cost.',
            'खेत से खरीदार तक फसल ले जानी है? पंजीकृत ड्राइवर खोजें, इस आधार पर कि कौन आपका माल ले जा सकता है और कीमत क्या होगी।'
          )}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{tt('Pickup district (farm)', 'पिकअप ज़िला (खेत)')}</label>
            <select value={pickupDistrict} onChange={(e) => setPickupDistrict(e.target.value)} className="sarthi-input cursor-pointer">
              {MP_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {isHi ? d.nameHi : d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{tt('Drop district (buyer)', 'ड्रॉप ज़िला (खरीदार)')}</label>
            <select value={dropDistrict} onChange={(e) => setDropDistrict(e.target.value)} className="sarthi-input cursor-pointer">
              {MP_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {isHi ? d.nameHi : d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">{tt('Quantity (quintal)', 'मात्रा (क्विंटल)')}</label>
          <input type="number" value={quantityQuintal} onChange={(e) => setQuantityQuintal(e.target.value)} className="sarthi-input" />
        </div>

        <button
          onClick={runSearch}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {tt('Find transport', 'ट्रांसपोर्ट खोजें')}
        </button>
      </Card>

      {hasSearched && !loading && (
        <>
          <div className="space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-400 px-1">
              {tt('Registered Drivers', 'पंजीकृत ड्राइवर')}
            </h2>
            {matches.length === 0 ? (
              <Card className="text-center text-gray-500 py-6 text-sm">
                {tt('No registered transporters yet.', 'अभी कोई पंजीकृत ट्रांसपोर्टर नहीं है।')}
              </Card>
            ) : (
              matches.map((m) => (
                <Card key={m.transporter.id} className={`space-y-2 ${!m.capacitySufficient ? 'opacity-70' : ''}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[var(--sarthi-on-background)]">{m.transporter.driverName}</h3>
                        {m.transporter.isDemoSeed && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            {tt('Demo · not real', 'डेमो · असली नहीं')}
                          </span>
                        )}
                        {!m.capacitySufficient && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full">
                            {tt('Too small for your load', 'आपके माल के लिए छोटी')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {isHi ? VEHICLE_TYPE_LABEL[m.transporter.vehicleType].hi : VEHICLE_TYPE_LABEL[m.transporter.vehicleType].en} ·{' '}
                        {tt('Capacity', 'क्षमता')} {m.transporter.capacityQuintal}q · {m.transporter.district}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {m.estimatedCost !== null ? (
                        <>
                          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">₹{m.estimatedCost}</p>
                          <p className="text-[11px] text-gray-500">
                            {m.costBasis === 'per_km' ? tt('estimated trip cost', 'अनुमानित यात्रा लागत') : tt('for your load', 'आपके माल के लिए')}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">{tt('Ask for price', 'भाव पूछें')}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {tt('Pickup', 'पिकअप')} ~{Math.round(m.pickupDistanceKm)} km ·{' '}
                    {tt('Route', 'रास्ता')} ~{Math.round(m.deliveryDistanceKm)} km
                  </p>
                  <div className="flex gap-2">
                    {m.transporter.contactPhone ? (
                      <a
                        href={`tel:${m.transporter.contactPhone}`}
                        className="flex-1 min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                      >
                        <Phone className="w-4 h-4" /> {tt('Call', 'कॉल करें')}
                      </a>
                    ) : (
                      <span className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-400 font-bold text-sm flex items-center justify-center">
                        {tt('No contact (demo)', 'संपर्क नहीं (डेमो)')}
                      </span>
                    )}
                    {m.transporter.lat != null && m.transporter.lng != null && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${m.transporter.lat},${m.transporter.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                      >
                        <Navigation2 className="w-4 h-4" /> {tt('Navigate', 'रास्ता')}
                      </a>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* OpenStreetMap — real transport/logistics businesses, no fabricated price */}
          <div className="space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400 px-1 flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              {tt('Transport Businesses Nearby (via OpenStreetMap)', 'आस-पास के ट्रांसपोर्ट व्यवसाय (OpenStreetMap से)')}
            </h2>
            {places.length === 0 ? (
              <Card className="text-center text-gray-500 py-6 text-sm">
                {tt('No transport businesses found nearby.', 'आस-पास कोई ट्रांसपोर्ट व्यवसाय नहीं मिला।')}
              </Card>
            ) : (
              places.map((p) => (
                <Card key={p.placeId} className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-[var(--sarthi-on-background)]">{p.name}</h3>
                      <p className="text-xs text-gray-500">{p.address}</p>
                    </div>
                    {p.rating !== null && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" /> {p.rating} ({p.userRatingsTotal})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 italic">{tt('Contact to ask about price and availability.', 'भाव और उपलब्धता के लिए संपर्क करें।')}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                  >
                    <Navigation2 className="w-4 h-4" /> {tt('Navigate', 'रास्ता')}
                  </a>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      <button
        onClick={() => setShowOnboarding(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
      >
        <Handshake className="w-5 h-5" />
        {tt('Are you a driver? Register your vehicle', 'क्या आप ड्राइवर हैं? अपनी गाड़ी पंजीकृत करें')}
      </button>

      {showOnboarding && (
        <TransporterOnboardingForm
          onClose={() => setShowOnboarding(false)}
          onRegistered={() => {
            if (hasSearched) runSearch();
          }}
        />
      )}
    </div>
  );
};
