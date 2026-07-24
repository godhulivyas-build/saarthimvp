import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';

export const TestimonialsSection: React.FC = () => {
  const { lang } = useI18n();
  const isHi = lang === 'hi';
  const tUI = (en: string, hi: string) => (isHi ? hi : en);

  const testimonials = [
    {
      id: 1,
      quoteEn: "Earlier we had to wait the whole day in mandi with no confirmation. If slot booking happens in advance, it will save our time and stress.",
      quoteHi: "पहले हमें मंडी में पूरा दिन बिना किसी पक्की खबर के इंतजार करना पड़ता था। अगर स्लॉट बुकिंग पहले से हो जाए, तो हमारा समय और तनाव बचेगा।",
      name: "Deepak Mandloi",
      nameHi: "दीपक मंडलोई",
      roleEn: "Chickpea Farmer • Balkhad Village",
      roleHi: "चना किसान • बलखड़ गाँव",
    },
    {
      id: 2,
      quoteEn: "We take produce to mandi without knowing the rate. Sometimes after transport cost, profit becomes very low. We need live price updates before dispatch.",
      quoteHi: "हम बिना भाव जाने मंडी में उपज ले जाते हैं। कभी-कभी ट्रांसपोर्ट खर्च के बाद मुनाफा बहुत कम रह जाता है। हमें भेजने से पहले लाइव भाव चाहिए।",
      name: "Shubham Patel",
      nameHi: "शुभम पटेल",
      roleEn: "Wheat Farmer • Regwa Village",
      roleHi: "गेहूं किसान • रेगवा गाँव",
    },
    {
      id: 3,
      quoteEn: "One tractor costs around ₹2500 and carries 50 quintal. For small farmers, transport itself becomes expensive. Shared transport would help a lot.",
      quoteHi: "एक ट्रैक्टर का खर्च लगभग ₹2500 आता है और 50 क्विंटल माल जाता है। छोटे किसानों के लिए ट्रांसपोर्ट ही महंगा हो जाता है। साझा ट्रांसपोर्ट से बहुत मदद मिलेगी।",
      name: "Shubham Patel",
      nameHi: "शुभम पटेल",
      roleEn: "Wheat Farmer • Regwa Village",
      roleHi: "गेहूं किसान • रेगवा गाँव",
    },
    {
      id: 4,
      quoteEn: "Sometimes rates are cut because of moisture checks, but farmers don’t know if testing is fair. Transparent quality checks are needed.",
      quoteHi: "कभी-कभी नमी की जांच के नाम पर भाव काट लिए जाते हैं, लेकिन किसानों को पता नहीं चलता कि जांच सही है या नहीं। पारदर्शी गुणवत्ता जांच की जरूरत है।",
      name: "Sandeep Mandloi",
      nameHi: "संदीप मंडलोई",
      roleEn: "Wheat Farmer • Balkhad Village",
      roleHi: "गेहूं किसान • बलखड़ गाँव",
    },
    {
      id: 5,
      quoteEn: "We depend too much on traders in mandi. If farmers get direct buyers and better rates, income can improve.",
      quoteHi: "हम मंडी में व्यापारियों पर बहुत ज्यादा निर्भर हैं। अगर किसानों को सीधे खरीदार और बेहतर भाव मिलें, तो आमदनी बढ़ सकती है।",
      name: "Sanjay Chaudhary",
      nameHi: "संजय चौधरी",
      roleEn: "Maize Farmer • Katkur Village",
      roleHi: "मक्का किसान • कटकुड़ गाँव",
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-[#1B4332] dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-amber-400 font-bold tracking-wider uppercase text-sm mb-4 block">
            {tUI('Farmer Voices', 'किसानों की आवाज़')}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            {tUI('Real Problems. Real Farmers. Real Solutions.', 'किसानों की असली आवाज़')}
          </h2>
          <p className="text-emerald-100/80 text-lg">
            {tUI(
              'Built after speaking with 30+ farmers across villages and understanding real mandi, pricing, transport, and storage challenges.',
              'गाँवों के 30+ किसानों से बात करके और मंडी, भाव, ट्रांसपोर्ट और भंडारण की वास्तविक चुनौतियों को समझकर बनाया गया।'
            )}
          </p>
        </div>

        {/* Desktop Grid Layout (Hidden on Mobile) */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, idx) => (
            <div key={t.id} className={`bg-emerald-900/40 backdrop-blur-sm border border-emerald-700/50 p-8 rounded-3xl hover:bg-emerald-800/50 transition-all duration-300 flex flex-col group ${idx === 4 ? 'lg:col-start-2' : ''}`}>
              <div className="mb-6 opacity-30 group-hover:opacity-100 group-hover:text-amber-400 transition-all">
                <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-emerald-50 text-lg leading-relaxed flex-1 mb-8">"{isHi ? t.quoteHi : t.quoteEn}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0">
                  {(isHi ? t.nameHi : t.name).charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold text-base">{isHi ? t.nameHi : t.name}</h4>
                  <p className="text-emerald-300 text-sm">{isHi ? t.roleHi : t.roleEn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel Layout (Hidden on Desktop) */}
        <div className="lg:hidden relative mb-16">
          <div className="overflow-hidden relative rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((t) => (
                <div key={t.id} className="w-full shrink-0 px-2">
                  <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-700/50 p-8 rounded-3xl h-full flex flex-col">
                    <div className="mb-6 text-amber-400 opacity-60">
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-emerald-50 text-lg leading-relaxed flex-1 mb-8">"{isHi ? t.quoteHi : t.quoteEn}"</p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0">
                        {(isHi ? t.nameHi : t.name).charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{isHi ? t.nameHi : t.name}</h4>
                        <p className="text-emerald-300 text-sm">{isHi ? t.roleHi : t.roleEn}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carousel Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full border border-emerald-700 flex items-center justify-center text-emerald-300 hover:bg-emerald-800 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-emerald-800'}`}
                />
              ))}
            </div>
            <button 
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full border border-emerald-700 flex items-center justify-center text-emerald-300 hover:bg-emerald-800 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="bg-emerald-950/50 rounded-2xl border border-emerald-900/50 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-amber-400 font-black text-2xl md:text-3xl mb-1">30+</div>
              <div className="text-emerald-200 text-xs md:text-sm font-medium">{tUI('Farmers Interviewed', 'किसानों से बातचीत')}</div>
            </div>
            <div>
              <div className="text-amber-400 font-black text-2xl md:text-3xl mb-1">15+</div>
              <div className="text-emerald-200 text-xs md:text-sm font-medium">{tUI('Villages Reached', 'गाँवों तक पहुँच')}</div>
            </div>
            <div>
              <div className="text-amber-400 font-black text-2xl md:text-3xl mb-1">100%</div>
              <div className="text-emerald-200 text-xs md:text-sm font-medium">{tUI('Ground Problems', 'ज़मीनी समस्याएँ')}</div>
            </div>
            <div>
              <div className="text-amber-400 font-black text-2xl md:text-3xl mb-1">✓</div>
              <div className="text-emerald-200 text-xs md:text-sm font-medium">{tUI('Built for Bharat', 'भारत के लिए निर्मित')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
