import React from 'react';
import { Loader2 } from 'lucide-react';
import { useVoiceAssistant } from '../voice/VoiceAssistantProvider';
import { useI18n } from '../i18n/I18nContext';
import { CONTACT } from '../config/contact';

export const SarthiDidi: React.FC = () => {
  const { toggle, speaking, listening, processing } = useVoiceAssistant();
  const { t, lang } = useI18n();

  const whatsappHref = `https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(CONTACT.whatsappPrefill)}`;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2 items-start">
      <div className="flex gap-3 ml-8 z-10 relative">
        <a 
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg text-white hover:scale-105 transition-transform"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
            <path d="M12.01,2.002c-5.522,0-10,4.477-10,10c0,1.756,0.454,3.465,1.319,4.981L2.005,22l5.13-1.346 c1.47,0.81,3.136,1.233,4.865,1.233c5.52,0,10-4.478,10-10C22.01,6.479,17.53,2.002,12.01,2.002z M17.06,16.59 c-0.23,0.648-1.326,1.232-1.838,1.298c-0.457,0.059-1.049,0.117-3.18-0.768c-2.55-1.06-4.184-3.665-4.312-3.834 c-0.128-0.17-1.029-1.365-1.029-2.605c0-1.24,0.641-1.848,0.871-2.083c0.23-0.235,0.499-0.294,0.665-0.294 c0.166,0,0.332,0,0.473,0.007c0.148,0.007,0.347-0.055,0.538,0.404c0.192,0.458,0.652,1.593,0.71,1.713 c0.058,0.118,0.096,0.256,0.019,0.412c-0.077,0.157-0.115,0.255-0.23,0.392c-0.115,0.138-0.243,0.294-0.345,0.406 c-0.115,0.124-0.238,0.262-0.108,0.478c0.128,0.215,0.569,0.935,1.218,1.512c0.838,0.745,1.545,0.975,1.763,1.092 c0.217,0.118,0.345,0.098,0.473-0.052c0.128-0.15,0.55-0.641,0.698-0.864c0.147-0.222,0.294-0.183,0.499-0.105 c0.204,0.078,1.291,0.608,1.514,0.72c0.224,0.111,0.371,0.176,0.428,0.274C17.28,15.657,17.28,16.146,17.06,16.59z" />
          </svg>
        </a>
        <button 
          onClick={toggle}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border hover:scale-105 transition-transform ${
            listening || speaking ? 'bg-red-600 border-red-500 text-white' : 'bg-white border-gray-100 text-emerald-600'
          }`}
        >
          {processing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : speaking ? (
            <span className="material-symbols-outlined text-[28px] animate-pulse">volume_up</span>
          ) : (
            <span className="material-symbols-outlined text-[28px]">mic</span>
          )}
        </button>
      </div>
      <div 
        onClick={toggle}
        className={`bg-[#d9d9d9] text-gray-800 p-4 rounded-xl shadow-xl max-w-[280px] flex gap-3 relative border border-gray-300/50 mt-[-16px] cursor-pointer hover:bg-gray-200 transition-colors ${
          listening || speaking ? 'ring-2 ring-red-400' : ''
        }`}
      >
        <div className="w-10 h-10 bg-emerald-600 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm relative">
          SD
          {(speaking || listening) && <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-pulse" aria-hidden />}
        </div>
        <div>
          <p className="font-bold text-[15px] mb-0.5 text-gray-900">{lang === 'hi' ? 'साथी दीदी' : 'Sarthi Didi'}</p>
          <p className="text-[13px] text-gray-700 leading-snug">
            {lang === 'hi' ? 'अगर समझ नहीं आ रहा, तो मुझे दबाइए। मैं मदद करती हूँ।' : 'If you need any help, just tap on me. I am here to guide you.'}
          </p>
        </div>
      </div>
    </div>
  );
};
