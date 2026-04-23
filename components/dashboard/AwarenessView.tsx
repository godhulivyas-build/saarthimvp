import React from 'react';
import { awarenessItems } from '../../services/awarenessData';
import { useI18n } from '../../i18n/I18nContext';
import { Megaphone, Sprout, MapPin } from 'lucide-react';

export const AwarenessView: React.FC = () => {
  const { lang, t } = useI18n();

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
          <Megaphone className="w-6 h-6" aria-hidden />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t('awareness.title')}</h2>
      </div>
      <div className="space-y-3">
        {awarenessItems.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex gap-3"
          >
            <div className="shrink-0 mt-0.5">
              {item.type === 'scheme' && <Sprout className="w-5 h-5 text-green-600" aria-hidden />}
              {item.type === 'workshop' && <Megaphone className="w-5 h-5 text-blue-600" aria-hidden />}
              {item.type === 'local' && <MapPin className="w-5 h-5 text-orange-600" aria-hidden />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {lang === 'hi' ? item.titleHi : item.titleEn}
              </h3>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                {lang === 'hi' ? item.detailHi : item.detailEn}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
