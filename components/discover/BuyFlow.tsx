import React, { useState } from 'react';
import { Search, Loader2, MapPin, Phone, Navigation2, Handshake, FlaskConical, Clock, Users } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../v2/ui/Card';
import { MP_DISTRICTS } from '../../config/mpLocations';
import { CROP_CATALOG } from '../../services/cropCatalog';
import { getMandiPriceForCrop, MandiPrice } from '../../services/mandiPriceService';
import { listFarmerListings, FarmerListing } from '../../services/farmerListings';
import { listRegisteredFarmers, RegisteredFarmer } from '../../services/farmerRegistry';
import { FarmerListingForm } from './FarmerListingForm';

type ListingWithComparison = {
  listing: FarmerListing;
  vsGovtPercent: number | null;
  distanceKm: number | null;
};

type RegisteredWithDistance = {
  farmer: RegisteredFarmer;
  distanceKm: number | null;
};

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Buyer-facing: traders, restaurants, malls, or households discovering farmer listings. */
export const BuyFlow: React.FC = () => {
  const { lang } = useI18n();
  const isHi = lang !== 'en';
  const tt = (en: string, hi: string) => (isHi ? hi : en);

  const [cropKey, setCropKey] = useState(CROP_CATALOG[0].key);
  const [districtName, setDistrictName] = useState('Khargone');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [govt, setGovt] = useState<{ price: MandiPrice | null; source: string; isSample: boolean } | null>(null);
  const [listings, setListings] = useState<ListingWithComparison[]>([]);
  const [registered, setRegistered] = useState<RegisteredWithDistance[]>([]);
  const [showListingForm, setShowListingForm] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const district = MP_DISTRICTS.find((d) => d.name === districtName) ?? MP_DISTRICTS[0];
      const [govtResult, farmerListings, registeredFarmers] = await Promise.all([
        getMandiPriceForCrop(cropKey, 'Madhya Pradesh'),
        listFarmerListings(cropKey, districtName),
        listRegisteredFarmers(cropKey, districtName),
      ]);
      setGovt(govtResult);

      const govtModal = govtResult.price?.modalPrice ?? null;
      const withComparison: ListingWithComparison[] = farmerListings
        .map((listing) => ({
          listing,
          vsGovtPercent:
            govtModal && govtModal > 0
              ? Math.round(((listing.askingPricePerQuintal - govtModal) / govtModal) * 100)
              : null,
          distanceKm:
            listing.lat != null && listing.lng != null
              ? distanceKm({ lat: district.lat, lng: district.lng }, { lat: listing.lat, lng: listing.lng })
              : null,
        }))
        .sort((a, b) => a.listing.askingPricePerQuintal - b.listing.askingPricePerQuintal);

      setListings(withComparison);

      const withDistance: RegisteredWithDistance[] = registeredFarmers
        .map((farmer) => ({
          farmer,
          distanceKm: distanceKm({ lat: district.lat, lng: district.lng }, { lat: farmer.lat, lng: farmer.lng }),
        }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

      setRegistered(withDistance);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <p className="text-sm text-gray-500">
          {tt(
            'Traders, restaurants, malls, or households — find fresh produce directly from farmers near you.',
            'व्यापारी, रेस्टोरेंट, मॉल, या घर — आस-पास के किसानों से सीधे ताज़ा उपज पाएं।'
          )}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{tt('Crop', 'फसल')}</label>
            <select value={cropKey} onChange={(e) => setCropKey(e.target.value)} className="sarthi-input cursor-pointer">
              {CROP_CATALOG.map((c) => (
                <option key={c.key} value={c.key}>
                  {isHi ? c.hi : c.en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{tt('District', 'ज़िला')}</label>
            <select value={districtName} onChange={(e) => setDistrictName(e.target.value)} className="sarthi-input cursor-pointer">
              {MP_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {isHi ? d.nameHi : d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={runSearch}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {tt('Find farmers & prices', 'किसान और भाव खोजें')}
        </button>
      </Card>

      {hasSearched && !loading && govt && (
        <>
          <Card className="space-y-2 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wide text-blue-700 dark:text-blue-400">
                {tt('Government Mandi Rate', 'सरकारी मंडी भाव')}
              </h2>
              {govt.isSample && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <FlaskConical className="w-3 h-3" /> {tt('Sample data', 'नमूना डेटा')}
                </span>
              )}
            </div>
            {govt.price ? (
              <>
                <p className="text-2xl font-black text-blue-800 dark:text-blue-300">
                  ₹{govt.price.modalPrice} <span className="text-sm font-medium text-gray-500">/quintal</span>
                </p>
                <p className="text-xs text-gray-500">
                  {govt.price.mandi} · {govt.price.date} · {govt.source}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">{tt('No government rate found for this crop today.', 'आज इस फसल का सरकारी भाव उपलब्ध नहीं है।')}</p>
            )}
          </Card>

          <div className="space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-400 px-1">
              {tt('Farmers Nearby', 'आस-पास के किसान')}
            </h2>
            {listings.length === 0 ? (
              <Card className="text-center text-gray-500 py-6 text-sm">
                {tt('No farmers have listed this crop in your district yet.', 'आपके ज़िले में इस फसल की अभी कोई लिस्टिंग नहीं है।')}
              </Card>
            ) : (
              listings.map(({ listing, vsGovtPercent, distanceKm: dist }) => (
                <Card key={listing.id} className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[var(--sarthi-on-background)]">{listing.farmerName}</h3>
                        {listing.isDemoSeed && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            {tt('Demo · not real', 'डेमो · असली नहीं')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {listing.district}
                        {listing.villageOrArea ? ` · ${listing.villageOrArea}` : ''} · {listing.quantityQuintal}{' '}
                        {tt('quintal available', 'क्विंटल उपलब्ध')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">₹{listing.askingPricePerQuintal}</p>
                      {vsGovtPercent !== null && (
                        <p className={`text-[11px] font-bold ${vsGovtPercent <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {vsGovtPercent >= 0 ? '+' : ''}
                          {vsGovtPercent}% {tt('vs govt', 'सरकारी से')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {dist !== null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> ~{Math.round(dist)} km ({tt('straight-line', 'सीधी दूरी')})
                      </span>
                    )}
                    {listing.readyBy && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {listing.readyBy}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {listing.contactPhone ? (
                      <a
                        href={`tel:${listing.contactPhone}`}
                        className="flex-1 min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                      >
                        <Phone className="w-4 h-4" /> {tt('Call', 'कॉल करें')}
                      </a>
                    ) : (
                      <span className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-400 font-bold text-sm flex items-center justify-center">
                        {tt('No contact (demo)', 'संपर्क नहीं (डेमो)')}
                      </span>
                    )}
                    {listing.lat != null && listing.lng != null && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`}
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

          {/* Real farmer registry — no price/quantity data, honestly framed as "who grows this, where" */}
          <div className="space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400 px-1 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {tt('Registered Farmers Growing This Crop', 'यह फसल उगाने वाले पंजीकृत किसान')}
            </h2>
            {registered.length === 0 ? (
              <Card className="text-center text-gray-500 py-6 text-sm">
                {tt('No registered farmers found for this crop in this district.', 'इस ज़िले में इस फसल के लिए कोई पंजीकृत किसान नहीं मिला।')}
              </Card>
            ) : (
              <>
                <p className="text-xs text-gray-500 px-1">
                  {tt(
                    'These farmers are real and registered on Sarthi, but have not set a sale price yet — call to ask about price and availability.',
                    'ये किसान असली हैं और सारथी पर पंजीकृत हैं, लेकिन उन्होंने अभी बिक्री भाव तय नहीं किया है — भाव और उपलब्धता के लिए कॉल करें।'
                  )}
                </p>
                {registered.map(({ farmer, distanceKm: dist }) => (
                  <Card key={farmer.id} className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-[var(--sarthi-on-background)]">{farmer.farmerName}</h3>
                        <p className="text-xs text-gray-500">
                          {farmer.village}, {farmer.district}
                        </p>
                      </div>
                      {dist !== null && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                          <MapPin className="w-3.5 h-3.5" /> ~{Math.round(dist)} km
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {farmer.contactPhone ? (
                        <a
                          href={`tel:${farmer.contactPhone}`}
                          className="flex-1 min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                        >
                          <Phone className="w-4 h-4" /> {tt('Call', 'कॉल करें')}
                        </a>
                      ) : (
                        <span className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-400 font-bold text-sm flex items-center justify-center">
                          {tt('No phone on file', 'फ़ोन उपलब्ध नहीं')}
                        </span>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${farmer.lat},${farmer.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-h-[44px] rounded-xl bg-[var(--sarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--sarthi-outline-soft)]"
                      >
                        <Navigation2 className="w-4 h-4" /> {tt('Navigate', 'रास्ता')}
                      </a>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </>
      )}

      <button
        onClick={() => setShowListingForm(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
      >
        <Handshake className="w-5 h-5" />
        {tt('Are you a farmer? List your produce', 'क्या आप किसान हैं? अपनी फसल सूचीबद्ध करें')}
      </button>

      {showListingForm && (
        <FarmerListingForm
          onClose={() => setShowListingForm(false)}
          onListed={() => {
            if (hasSearched) runSearch();
          }}
        />
      )}
    </div>
  );
};
