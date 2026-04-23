import React, { useEffect, useState } from 'react';
import { getGovAlerts, getCategoryIcon, type GovAlert } from '../../services/govAlertsService.ts';
import { useI18n } from '../../i18n/I18nContext.tsx';
import { Bell } from 'lucide-react';

const CAT_COLORS: Record<GovAlert['category'], string> = {
  scheme: 'bg-blue-50 border-blue-200 text-blue-800',
  weather: 'bg-red-50 border-red-200 text-red-800',
  advisory: 'bg-amber-50 border-amber-200 text-amber-800',
  market: 'bg-green-50 border-green-200 text-green-800',
  workshop: 'bg-purple-50 border-purple-200 text-purple-800',
};

type Props = { compact?: boolean };

export const GovAlertsPanel: React.FC<Props> = ({ compact = false }) => {
  const [alerts, setAlerts] = useState<GovAlert[]>([]);
  const { lang } = useI18n();
  const isHi = lang === 'hi';

  useEffect(() => {
    getGovAlerts().then(setAlerts);
  }, []);

  if (alerts.length === 0) return null;

  const displayed = compact ? alerts.slice(0, 3) : alerts;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-white flex items-center gap-2">
        <Bell className="w-5 h-5" />
        <h3 className="font-bold">{isHi ? '🔔 सरकारी सूचनाएं' : '🔔 Government Alerts'}</h3>
      </div>

      <div className="divide-y divide-gray-50">
        {displayed.map((a) => (
          <div key={a.id} className="px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{getCategoryIcon(a.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{isHi ? a.titleHi : a.title}</p>
                <p className="text-xs text-gray-600 mt-1">{isHi ? a.bodyHi : a.body}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CAT_COLORS[a.category]}`}>
                    {a.category}
                  </span>
                  <span className="text-[10px] text-gray-400">{a.date}</span>
                </div>
                {a.url && (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 font-bold mt-1 inline-block hover:underline"
                  >
                    {isHi ? 'और पढ़ें →' : 'Read more →'}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {compact && alerts.length > 3 && (
        <div className="px-4 py-2 bg-gray-50 text-center">
          <span className="text-sm text-red-600 font-bold">
            {isHi ? `+ ${alerts.length - 3} और सूचनाएं →` : `+ ${alerts.length - 3} more alerts →`}
          </span>
        </div>
      )}
    </div>
  );
};
