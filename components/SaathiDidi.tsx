import React from 'react';
import { Mic, Volume2, Loader2, MessageCircle } from 'lucide-react';
import { useVoiceAssistant } from '../voice/VoiceAssistantProvider';
import { useI18n } from '../i18n/I18nContext';
import { CONTACT } from '../config/contact';

export const SaathiDidi: React.FC = () => {
  const { toggle, speaking, listening, processing } = useVoiceAssistant();
  const { t } = useI18n();

  const whatsappHref = `https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(CONTACT.whatsappPrefill)}`;

  return (
    <div className="fixed bottom-24 right-4 z-[75] max-w-[260px] flex flex-col gap-2">
      {/* Vertical action dock (won't overlap text) */}
      <div className="flex flex-col gap-2 items-end">
        <button
          type="button"
          onClick={toggle}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 active:scale-95 ${
            listening || speaking
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-green-700 border-green-200'
          }`}
          aria-label="Mic"
          title="Mic"
        >
          {processing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : speaking ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center border-2 border-white active:scale-95"
          aria-label="WhatsApp"
          title="WhatsApp"
        >
          <MessageCircle className="w-6 h-6" aria-hidden />
        </a>
      </div>

      {/* Saathi Didi dialogue card */}
      <button
        type="button"
        onClick={toggle}
        className={`w-full flex items-center gap-3 saarthi-glass-panel border-0 rounded-2xl p-3 shadow-lg active:scale-[0.99] ${
          speaking || listening ? 'ring-2 ring-red-300' : 'ring-1 ring-green-200/60'
        }`}
        aria-label={t('saathiDidi.name')}
      >
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
            SD
          </div>
          <span className="absolute -inset-1 rounded-full border-2 border-green-300 animate-pulse" aria-hidden />
        </div>
        <div className="text-left">
          <p className="font-bold text-gray-900">{t('saathiDidi.name')}</p>
          <p className="text-xs text-gray-600 leading-snug">{t('saathiDidi.prompt')}</p>
        </div>
      </button>
    </div>
  );
};
