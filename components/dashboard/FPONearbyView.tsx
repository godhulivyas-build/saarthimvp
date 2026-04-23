import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Users, MapPin } from 'lucide-react';

const fpos = [
  { id: '1', nameHi: 'इंदौर सहकारी FPO', nameEn: 'Indore Cooperative FPO', km: 14 },
  { id: '2', nameHi: 'उज्जैन किसान समूह', nameEn: 'Ujjain Farmer Group', km: 28 },
  { id: '3', nameHi: 'देवास महिला FPO', nameEn: 'Dewas Women FPO', km: 35 },
];

export const FPONearbyView: React.FC = () => {
  const { lang, t } = useI18n();
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  return (
    <div className="p-4 pb-24 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="text-blue-600" aria-hidden />
        {t('fpo.title')}
      </h2>
      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-xl p-3">
        {lang === 'hi'
          ? 'FPO से बेहतर दाम, ट्रेनिंग और बीज-खाद में मदद मिल सकती है।'
          : 'FPOs can help with better prices, training, and inputs.'}
      </p>
      <ul className="space-y-3">
        {fpos.map((f) => (
          <li key={f.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between gap-2">
              <p className="font-bold text-gray-900 text-lg">{lang === 'hi' ? f.nameHi : f.nameEn}</p>
              <span className="text-sm text-gray-500 flex items-center gap-1 shrink-0">
                <MapPin className="w-4 h-4" aria-hidden />
                {f.km} {t('fpo.distance')}
              </span>
            </div>
            <button
              type="button"
              disabled={joined[f.id]}
              onClick={() => setJoined((prev) => ({ ...prev, [f.id]: true }))}
              className="min-h-[48px] rounded-xl bg-blue-600 text-white font-bold text-base disabled:bg-gray-300"
            >
              {joined[f.id] ? (lang === 'hi' ? 'जॉइन हो गया' : 'Joined') : t('action.joinFpo')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
