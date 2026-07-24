import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../v2/ui/Card';
import { createFarmerListing } from '../../services/farmerListings';
import { CROP_CATALOG } from '../../services/cropCatalog';
import { MP_DISTRICTS } from '../../config/mpLocations';

type Props = {
  onClose: () => void;
  onListed: () => void;
};

export const FarmerListingForm: React.FC<Props> = ({ onClose, onListed }) => {
  const { lang } = useI18n();
  const isHi = lang !== 'en';
  const tt = (en: string, hi: string) => (isHi ? hi : en);

  const [farmerName, setFarmerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [districtName, setDistrictName] = useState(MP_DISTRICTS[0].name);
  const [villageOrArea, setVillageOrArea] = useState('');
  const [cropKey, setCropKey] = useState(CROP_CATALOG[0].key);
  const [quantityQuintal, setQuantityQuintal] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [readyBy, setReadyBy] = useState(tt('Ready now', 'अभी तैयार'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!farmerName.trim() || !contactPhone.trim() || !quantityQuintal || !askingPrice) {
      setError(
        tt(
          'Please fill your name, phone, quantity, and price.',
          'कृपया अपना नाम, फ़ोन, मात्रा, और भाव भरें।'
        )
      );
      return;
    }

    setSaving(true);
    try {
      const district = MP_DISTRICTS.find((d) => d.name === districtName)!;
      await createFarmerListing({
        farmerName: farmerName.trim(),
        contactPhone: contactPhone.trim(),
        state: 'Madhya Pradesh',
        district: district.name,
        villageOrArea: villageOrArea.trim() || undefined,
        lat: district.lat,
        lng: district.lng,
        crop: cropKey,
        quantityQuintal: Number(quantityQuintal),
        askingPricePerQuintal: Number(askingPrice),
        readyBy: readyBy.trim() || undefined,
      });
      setDone(true);
      onListed();
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
            {tt('List your produce', 'अपनी फसल सूचीबद्ध करें')}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--sarthi-surface-low)]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">✅</div>
            <p className="font-bold text-[var(--sarthi-primary)]">
              {tt('Listed! Buyers nearby can now find you.', 'सूचीबद्ध हो गया! आस-पास के खरीदार अब आपको खोज सकते हैं।')}
            </p>
            <button onClick={onClose} className="mt-2 px-6 py-2 rounded-xl bg-[var(--sarthi-primary)] text-white font-bold">
              {tt('Done', 'ठीक है')}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {tt(
                'Traders, restaurants, and households nearby will see this listing — free.',
                'आस-पास के व्यापारी, रेस्टोरेंट और घर इस लिस्टिंग को देखेंगे — मुफ़्त में।'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Your name', 'आपका नाम')}</label>
                <input value={farmerName} onChange={(e) => setFarmerName(e.target.value)} className="sarthi-input" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Phone number', 'फ़ोन नंबर')}</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="sarthi-input" placeholder="+91" />
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
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Village / area (optional)', 'गांव / क्षेत्र (वैकल्पिक)')}</label>
                <input value={villageOrArea} onChange={(e) => setVillageOrArea(e.target.value)} className="sarthi-input" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Crop', 'फसल')}</label>
                <select value={cropKey} onChange={(e) => setCropKey(e.target.value)} className="sarthi-input cursor-pointer">
                  {CROP_CATALOG.map((c) => (
                    <option key={c.key} value={c.key}>
                      {isHi ? c.hi : c.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Quantity (quintal)', 'मात्रा (क्विंटल)')}</label>
                <input
                  type="number"
                  value={quantityQuintal}
                  onChange={(e) => setQuantityQuintal(e.target.value)}
                  className="sarthi-input"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Your asking price (₹/quintal)', 'आपका मांगा भाव (₹/क्विंटल)')}</label>
                <input type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} className="sarthi-input" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('When is it ready?', 'कब तैयार होगी?')}</label>
                <input value={readyBy} onChange={(e) => setReadyBy(e.target.value)} className="sarthi-input" />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[var(--sarthi-primary)] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {tt('List my produce', 'अपनी फसल सूचीबद्ध करें')}
            </button>
          </>
        )}
      </Card>
    </div>
  );
};
