import React, { useEffect, useState } from 'react';
import { UserPreferences, ProduceItem } from '../../types';
import { listProduce, requestPickup } from '../../services/mvpDataService';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../ui/Button';
import { Loader2, Truck } from 'lucide-react';

type PickupRequestViewProps = {
  preferences: UserPreferences | null;
  onCreated?: () => void;
};

const LOCATIONS = [
  'Indore', 'Bhopal', 'Jabalpur', 'Ujjain', 'Dewas',
  'Sagar', 'Ratlam', 'Hoshangabad', 'Neemuch', 'Mandsaur',
];

const QTY_PRESETS = [1, 5, 10, 25, 50];

const farmerLabel = (prefs: UserPreferences | null): string => {
  if (prefs?.location?.trim()) return prefs.location;
  return 'Farmer';
};

export const PickupRequestView: React.FC<PickupRequestViewProps> = ({ preferences, onCreated }) => {
  const { t } = useI18n();
  const [produce, setProduce] = useState<ProduceItem[]>([]);
  const [produceId, setProduceId] = useState('');
  const [from, setFrom] = useState(preferences?.location || '');
  const [to, setTo] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const list = await listProduce();
      setProduce(list);
      if (list[0]) setProduceId(list[0].id);
      setLoading(false);
    };
    run();
  }, []);

  useEffect(() => {
    if (preferences?.location) setFrom(preferences.location);
  }, [preferences?.location]);

  const selected = produce.find((p) => p.id === produceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !from || !to || qty <= 0) return;
    setSubmitting(true);
    await requestPickup({
      produceId: selected.id,
      farmerName: farmerLabel(preferences),
      pickupLocation: from,
      dropLocation: to,
      quantity: qty,
      unit: selected.unit,
    });
    setSubmitting(false);
    setDone(true);
    onCreated?.();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="p-6 text-center pb-24">
        <Truck className="w-14 h-14 text-green-600 mx-auto mb-4" aria-hidden />
        <p className="text-lg font-bold text-gray-900">OK ✓</p>
        <p className="text-gray-600 mt-2">{t('pickup.submit')} ✓</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Truck className="text-green-600" aria-hidden />
        {t('pickup.title')}
      </h2>
      {!selected ? (
        <p className="text-gray-500">{t('produce.empty')}</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-5 shadow-sm">
          {/* Produce selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pickup.selectProduce')}</label>
            <select
              value={produceId}
              onChange={(e) => setProduceId(e.target.value)}
              className="w-full min-h-[48px] border border-gray-300 rounded-xl px-3 py-3 text-base bg-white"
            >
              {produce.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.crop} — {p.quantity} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup from — dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pickup.from')}</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full min-h-[48px] border border-gray-300 rounded-xl px-3 py-3 text-base bg-white"
              required
            >
              <option value="">{t('pickup.from')}…</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Drop-off to — dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pickup.to')}</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full min-h-[48px] border border-gray-300 rounded-xl px-3 py-3 text-base bg-white"
              required
            >
              <option value="">{t('pickup.to')}…</option>
              {LOCATIONS.filter((l) => l !== from).map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Quantity — preset buttons + display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('produce.qty')}</label>
            <div className="flex flex-wrap gap-2">
              {QTY_PRESETS.filter((q) => q <= (selected?.quantity ?? 999)).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQty(q)}
                  className={`min-h-[44px] min-w-[56px] rounded-xl border-2 font-bold text-base ${
                    qty === q ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selected?.unit} (max {selected?.quantity})
            </p>
          </div>

          <Button type="submit" fullWidth disabled={submitting || !from || !to}>
            {submitting ? <Loader2 className="animate-spin mx-auto" /> : t('pickup.submit')}
          </Button>
        </form>
      )}
    </div>
  );
};
