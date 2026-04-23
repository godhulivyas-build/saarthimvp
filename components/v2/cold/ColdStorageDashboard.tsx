import React, { useEffect, useState } from 'react';
import type { ColdStorageDashboardView } from '../../../types';
import { useI18n } from '../../../i18n/I18nContext';
import { listColdSlots, listColdRequests, updateColdRequest } from '../../../services/coldStorageService';
import type { ColdStorageRequest, ColdStorageSlot } from '../../../types';
import { Loader2, Warehouse } from 'lucide-react';

type Props = {
  view: ColdStorageDashboardView;
};

export const ColdStorageDashboard: React.FC<Props> = ({ view }) => {
  const { t, tV2 } = useI18n();
  const [slots, setSlots] = useState<ColdStorageSlot[]>([]);
  const [reqs, setReqs] = useState<ColdStorageRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const [s, r] = await Promise.all([listColdSlots(), listColdRequests()]);
      setSlots(s);
      setReqs(r);
      setLoading(false);
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--saarthi-primary)]" />
      </div>
    );
  }

  const occ = slots.length ? Math.round((slots.reduce((a, s) => a + s.usedTons, 0) / slots.reduce((a, s) => a + s.capacityTons, 0)) * 100) : 0;

  if (view === 'home') {
    return (
      <div className="p-4 space-y-4 pb-28">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[var(--saarthi-surface-high)]">
          <p className="text-sm text-gray-600">{tV2('v2.cold.occupancy')}</p>
          <p className="text-3xl font-extrabold text-[var(--saarthi-primary)]">{occ}%</p>
        </div>
        <p className="text-sm text-gray-600">{t('dashboard.viewAll')}</p>
      </div>
    );
  }

  if (view === 'slots') {
    return (
      <div className="p-4 space-y-3 pb-28">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Warehouse className="text-[var(--saarthi-tertiary)]" />
          {tV2('v2.cold.slots')}
        </h2>
        {slots.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <p className="font-bold">{s.label}</p>
            <p className="text-sm text-gray-600">
              {s.usedTons} / {s.capacityTons} t · ₹{s.pricePerTonDay}/t/day
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (view === 'requests') {
    return (
      <div className="p-4 space-y-3 pb-28">
        <h2 className="text-lg font-bold">{tV2('v2.cold.requests')}</h2>
        {reqs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('dashboard.noRequests')}</p>
        ) : (
          reqs.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white border p-4 shadow-sm space-y-2">
              <p className="font-bold">{r.crop}</p>
              <p className="text-sm text-gray-600">
                {r.farmerName} · {r.tons} t
              </p>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 min-h-[44px] rounded-xl bg-green-600 text-white font-bold text-sm"
                    onClick={() => updateColdRequest(r.id, 'accepted').then(() => listColdRequests().then(setReqs))}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="flex-1 min-h-[44px] rounded-xl border-2 font-bold text-sm"
                    onClick={() => updateColdRequest(r.id, 'rejected').then(() => listColdRequests().then(setReqs))}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  if (view === 'analytics') {
    const total = slots.reduce((a, s) => a + s.capacityTons, 0);
    const used = slots.reduce((a, s) => a + s.usedTons, 0);
    const revenueDay = slots.reduce((a, s) => a + s.usedTons * s.pricePerTonDay, 0);
    return (
      <div className="p-4 pb-28 space-y-4">
        <h2 className="text-lg font-extrabold saarthi-headline">{tV2('v2.cold.occupancy')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
            <p className="text-xs text-[var(--saarthi-on-surface-variant)] font-bold">Capacity</p>
            <p className="text-2xl font-black text-[var(--saarthi-on-background)]">{total}t</p>
          </div>
          <div className="rounded-2xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
            <p className="text-xs text-[var(--saarthi-on-surface-variant)] font-bold">Used</p>
            <p className="text-2xl font-black text-[var(--saarthi-primary)]">{used}t</p>
          </div>
          <div className="rounded-2xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
            <p className="text-xs text-[var(--saarthi-on-surface-variant)] font-bold">Occupancy</p>
            <p className="text-2xl font-black text-[var(--saarthi-primary)]">{occ}%</p>
          </div>
          <div className="rounded-2xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
            <p className="text-xs text-[var(--saarthi-on-surface-variant)] font-bold">Est. revenue/day</p>
            <p className="text-2xl font-black text-[var(--saarthi-on-background)]">₹{Math.round(revenueDay)}</p>
          </div>
        </div>
        <p className="text-xs text-[var(--saarthi-on-surface-variant)] opacity-80">
          Demo analytics. Later: connect to bookings, invoices, and sensor compliance.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-28">
      <h2 className="text-lg font-bold">{tV2('v2.logistics.earnings')}</h2>
      <p className="text-sm text-gray-600 mt-2">₹ 12,400 {t('common.loading')}</p>
    </div>
  );
};
