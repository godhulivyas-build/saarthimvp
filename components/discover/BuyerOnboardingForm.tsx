import React, { useState } from 'react';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../v2/ui/Card';
import { BUYER_TYPE_LABEL, BuyerType, registerBuyer } from '../../services/buyerDirectory';
import { CROP_CATALOG } from '../../services/cropCatalog';
import { MP_DISTRICTS } from '../../config/mpLocations';

type CropRow = { cropKey: string; pricePerQuintal: string };

type Props = {
  onClose: () => void;
  onRegistered: () => void;
};

export const BuyerOnboardingForm: React.FC<Props> = ({ onClose, onRegistered }) => {
  const { lang } = useI18n();
  const isHi = lang !== 'en';
  const tt = (en: string, hi: string) => (isHi ? hi : en);

  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState<BuyerType>('wholesaler');
  const [districtName, setDistrictName] = useState(MP_DISTRICTS[0].name);
  const [villageOrArea, setVillageOrArea] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [rows, setRows] = useState<CropRow[]>([{ cropKey: CROP_CATALOG[0].key, pricePerQuintal: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const addRow = () => setRows((r) => [...r, { cropKey: CROP_CATALOG[0].key, pricePerQuintal: '' }]);
  const removeRow = (idx: number) => setRows((r) => r.filter((_, i) => i !== idx));
  const updateRow = (idx: number, patch: Partial<CropRow>) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const handleSubmit = async () => {
    setError(null);
    const validRows = rows.filter((r) => r.pricePerQuintal && Number(r.pricePerQuintal) > 0);
    if (!businessName.trim() || !contactPhone.trim() || validRows.length === 0) {
      setError(
        tt(
          'Please fill business name, phone, and at least one crop with a price.',
          'कृपया व्यवसाय का नाम, फ़ोन नंबर, और कम से कम एक फसल का भाव भरें।'
        )
      );
      return;
    }

    setSaving(true);
    try {
      const district = MP_DISTRICTS.find((d) => d.name === districtName)!;
      await registerBuyer({
        businessName: businessName.trim(),
        buyerType,
        state: 'Madhya Pradesh',
        district: district.name,
        villageOrArea: villageOrArea.trim() || undefined,
        lat: district.lat,
        lng: district.lng,
        contactPhone: contactPhone.trim(),
        contactName: contactName.trim() || undefined,
        crops: validRows.map((r) => ({
          crop: r.cropKey,
          pricePerQuintal: Number(r.pricePerQuintal),
          updatedAt: new Date().toISOString(),
        })),
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
            {tt('Partner with Sarthi', 'सारथी के साथ जुड़ें')}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--sarthi-surface-low)]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">✅</div>
            <p className="font-bold text-[var(--sarthi-primary)]">
              {tt('Thanks! Your business is listed.', 'धन्यवाद! आपका व्यवसाय सूचीबद्ध हो गया।')}
            </p>
            <p className="text-sm text-gray-500">
              {tt(
                'Farmers nearby can now discover you. We may call to verify your details.',
                'आस-पास के किसान अब आपको खोज सकते हैं। हम विवरण सत्यापित करने के लिए कॉल कर सकते हैं।'
              )}
            </p>
            <button onClick={onClose} className="mt-2 px-6 py-2 rounded-xl bg-[var(--sarthi-primary)] text-white font-bold">
              {tt('Done', 'ठीक है')}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {tt(
                'Restaurants, wholesalers, malls, cold storages, and processors can list themselves here — free.',
                'रेस्टोरेंट, थोक व्यापारी, मॉल, कोल्ड स्टोरेज और प्रोसेसिंग यूनिट यहां मुफ़्त में सूचीबद्ध हो सकते हैं।'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Business name', 'व्यवसाय का नाम')}</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="sarthi-input"
                  placeholder={tt('e.g. Sharma Wholesale Traders', 'उदा. शर्मा होलसेल ट्रेडर्स')}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Business type', 'व्यवसाय का प्रकार')}</label>
                <select value={buyerType} onChange={(e) => setBuyerType(e.target.value as BuyerType)} className="sarthi-input cursor-pointer">
                  {Object.entries(BUYER_TYPE_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>
                      {isHi ? label.hi : label.en}
                    </option>
                  ))}
                </select>
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
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Area / village (optional)', 'क्षेत्र / गांव (वैकल्पिक)')}</label>
                <input value={villageOrArea} onChange={(e) => setVillageOrArea(e.target.value)} className="sarthi-input" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Contact name (optional)', 'संपर्क नाम (वैकल्पिक)')}</label>
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="sarthi-input" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">{tt('Phone number', 'फ़ोन नंबर')}</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="sarthi-input" placeholder="+91" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">
                {tt('Crops you buy, and today\'s price (₹ per quintal)', 'आप जो फसल खरीदते हैं, और आज का भाव (₹/क्विंटल)')}
              </label>
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={row.cropKey}
                      onChange={(e) => updateRow(idx, { cropKey: e.target.value })}
                      className="sarthi-input cursor-pointer flex-1"
                    >
                      {CROP_CATALOG.map((c) => (
                        <option key={c.key} value={c.key}>
                          {isHi ? c.hi : c.en}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={row.pricePerQuintal}
                      onChange={(e) => updateRow(idx, { pricePerQuintal: e.target.value })}
                      placeholder="₹/quintal"
                      className="sarthi-input w-28"
                    />
                    {rows.length > 1 && (
                      <button onClick={() => removeRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addRow} className="mt-2 text-sm font-bold text-[var(--sarthi-primary)] flex items-center gap-1">
                <Plus className="w-4 h-4" /> {tt('Add another crop', 'एक और फसल जोड़ें')}
              </button>
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[var(--sarthi-primary)] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {tt('List my business', 'अपना व्यवसाय सूचीबद्ध करें')}
            </button>
          </>
        )}
      </Card>
    </div>
  );
};
