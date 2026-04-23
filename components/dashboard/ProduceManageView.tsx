import React, { useEffect, useState } from 'react';
import { UserPreferences, ProductUnit, ProduceItem } from '../../types';
import { addProduce, listProduce } from '../../services/mvpDataService';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader2, Plus } from 'lucide-react';

type ProduceManageViewProps = {
  preferences: UserPreferences | null;
  onChanged?: () => void;
};

const farmerLabel = (prefs: UserPreferences | null): string => {
  if (prefs?.location?.trim()) return `किसान (${prefs.location})`;
  return 'किसान';
};

const farmerLocation = (prefs: UserPreferences | null): string =>
  prefs?.location?.trim() || 'स्थान नहीं';

export const ProduceManageView: React.FC<ProduceManageViewProps> = ({ preferences, onChanged }) => {
  const { t } = useI18n();
  const [items, setItems] = useState<ProduceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [crop, setCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<ProductUnit>('quintal');
  const [price, setPrice] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await listProduce();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(quantity);
    const p = Number(price);
    if (!crop.trim() || !Number.isFinite(q) || q <= 0 || !Number.isFinite(p) || p <= 0) return;
    setSaving(true);
    await addProduce({
      farmerName: farmerLabel(preferences),
      farmerLocation: farmerLocation(preferences),
      crop: crop.trim(),
      quantity: q,
      unit,
      pricePerUnit: p,
    });
    setCrop('');
    setQuantity('');
    setPrice('');
    setSaving(false);
    await load();
    onChanged?.();
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Plus className="text-green-600 w-6 h-6" aria-hidden />
        {t('produce.title')}
      </h2>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <p className="font-semibold text-gray-800">{t('produce.add')}</p>
        <Input label={t('produce.crop')} value={crop} onChange={(e) => setCrop(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('produce.qty')} type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('produce.unit')}</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as ProductUnit)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
            >
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="ton">ton</option>
            </select>
          </div>
        </div>
        <Input label={t('produce.price')} type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
        <Button type="submit" fullWidth disabled={saving}>
          {saving ? <Loader2 className="animate-spin mx-auto" /> : t('produce.add')}
        </Button>
      </form>

      <div>
        <h3 className="font-bold text-gray-800 mb-3">{t('produce.list')}</h3>
        {loading ? (
          <div className="flex justify-center py-12 text-gray-400">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-dashed">{t('produce.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="font-bold text-gray-900 text-lg">{it.crop}</p>
                <p className="text-sm text-gray-600">
                  {it.quantity} {it.unit} · ₹{it.pricePerUnit}/{it.unit}
                </p>
                <p className="text-xs text-gray-500 mt-1">{it.farmerLocation}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
