import React, { useEffect, useState } from 'react';
import { UserPreferences, Order } from '../../types';
import { listOrders } from '../../services/mvpDataService';
import { useI18n } from '../../i18n/I18nContext';
import { Loader2, Package } from 'lucide-react';

type BuyerOrdersViewProps = {
  preferences: UserPreferences | null;
};

export const BuyerOrdersView: React.FC<BuyerOrdersViewProps> = ({ preferences }) => {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loc = preferences?.location?.trim().toLowerCase() || '';

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const all = await listOrders();
      setOrders(
        loc ? all.filter((o) => o.buyerLocation.toLowerCase().includes(loc) || o.buyerName.toLowerCase().includes(loc)) : all
      );
      setLoading(false);
    };
    run();
  }, [loc]);

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Package className="text-purple-600" aria-hidden />
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
              <p className="text-xs text-gray-500 mt-1">{o.farmerName}</p>
              <span className="inline-block mt-2 text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-800">{o.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
