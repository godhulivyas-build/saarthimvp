import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

const FarmerPhoneSection: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const isHi = lang === 'hi';

  return (
    <section id="how-it-works" className="py-20 px-6 bg-white dark:bg-slate-900 border-t border-emerald-50 dark:border-emerald-900">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 order-2 lg:order-1">
          <div className="relative max-w-md mx-auto lg:mx-0">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative border-4 border-white dark:border-slate-800">
              <img 
                alt={isHi ? "स्मार्टफोन के साथ भारतीय किसान" : "Indian farmer with smartphone"} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB43u22HqHhai6NMTMSb4EedzTHJi6ztugaxs1-iofkc_cydLOIT0MjqLZglKnSRzaUxiUVgN26cwxytjs7qAJ9FE-wMI9zn9loGmlO8IB5Pv7FXo0Z5rlEh_q6DPVCpMhTdqOl99G3ZU_Bmm9pEuPBYR3wXMzFaKT9Uf2HXRxB4QrvoJAYIEdicPS00r0KBO8VTVGO_LQSWQknuXQ0HZoqMNa9FBltSnFSMkOjG_zUnL6HGXqdTT4lO816wSgLhfKwQln1zmPTENs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 text-white pointer-events-none">
                <p className="text-lg font-bold mb-2">
                  {isHi ? "रामकुमार, मध्य प्रदेश" : "Ramkumar, Madhya Pradesh"}
                </p>
                <p className="text-sm opacity-90 leading-relaxed">
                  {isHi
                    ? '"सारथी ने बताया आस-पास कौन खरीद रहा है और आज का भाव क्या है — मैंने बिना अंदाज़े के बेहतर दाम पर बेचा।"'
                    : '"Sarthi showed me who was buying nearby and today\'s rate — I sold at a better price without guessing."'}
                </p>
              </div>
            </div>
            
            {/* CTA Button Badge replacing Sarthi Setu Label */}
            <div className="absolute -right-6 lg:-right-12 top-1/2 -translate-y-1/2 z-10 hover:scale-105 transition-transform">
              <button 
                onClick={() => navigate('/onboarding')}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-emerald-100 dark:border-emerald-800 flex flex-col gap-1 items-center"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-700 dark:text-emerald-300">
                    <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>verified</span>
                  </div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-100 text-sm">
                    {isHi ? "सारथी सेतु – अभी आज़माएँ" : "Sarthi Setu – Try Now"}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-bold uppercase tracking-wider">
                  {isHi ? "खोज · भाव · AI सलाह" : "Discovery · Prices · AI advice"}
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 order-1 lg:order-2 flex flex-col gap-6 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight leading-tight">
            {isHi ? "खेत से बाज़ार तक, सब एक जगह" : "The right buyer, at the right price"}
          </h2>
          <p className="text-lg text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">
            {isHi 
              ? "देखें आपके पास कौन खरीद रहा है, आज के भाव की तुलना करें और तय करें कहाँ बेचना सबसे अच्छा है — सब आपकी भाषा में।"
              : "See who's buying near you, compare today's prices, and decide the best place to sell — all in your language."}
          </p>

          <div className="flex flex-col gap-4 mt-4">
             <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-xl shrink-0 text-emerald-600">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-emerald-950 dark:text-emerald-50">{isHi ? "बेहतर दाम" : "Better Prices"}</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300/80">{isHi ? "मंडी के ताज़ा भाव जानें और सही समय पर बेचें।" : "Get live mandi rates and sell at the right time."}</p>
                </div>
             </div>

             <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-xl shrink-0 text-emerald-600">
                  <span className="material-symbols-outlined">storefront</span>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-emerald-950 dark:text-emerald-50">{isHi ? "आस-पास के खरीदार" : "Nearby buyers"}</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300/80">{isHi ? "अपने पास के व्यापारी, मंडी और होटल एक नज़र में देखें।" : "See traders, mandis and restaurants close to you at a glance."}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FarmerPhoneSection;
