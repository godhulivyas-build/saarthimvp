import React, { useEffect, useState } from 'react';
import { UserPreferences, Order } from '../../types';
import { listOrders, listProduce } from '../../services/mvpDataService';
import { useI18n } from '../../i18n/I18nContext';
import { Loader2, Package } from 'lucide-react';

type FarmerOrdersViewProps = {
  preferences: UserPreferences | null;
};

export const FarmerOrdersView: React.FC<FarmerOrdersViewProps> = ({ preferences }) => {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loc = preferences?.location?.trim().toLowerCase() || '';

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const [allOrders, produce] = await Promise.all([listOrders(), listProduce()]);
      const mine = new Set(
        produce.filter((p) => !loc || p.farmerLocation.toLowerCase().includes(loc)).map((p) => p.id)
      );
      setOrders(allOrders.filter((o) => mine.has(o.produceId)));
      setLoading(false);
    };
    run();
  }, [loc]);

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Package className="text-green-600" aria-hidden />
        {t('orders.title')}
      </h2>
      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-dashed">{t('orders.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{o.crop}</p>
              <p className="text-sm text-gray-600">
                {o.quantity} {o.unit} · ₹{o.totalAmount}
              </p>
              <p className="text-xs text-gray-500 mt-1">{o.buyerName}</p>
              <span className="inline-block mt-2 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-800">{o.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
