import React from 'react';
import { useI18n } from '../../i18n/I18nContext';

const LiveMapSection: React.FC = () => {
  const { lang } = useI18n();
  const isHi = lang === 'hi';

  return (
    <div className="relative bg-emerald-50/20 dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-emerald-100 dark:border-emerald-800 shadow-xl min-h-[600px] flex flex-col items-center justify-center max-w-7xl mx-auto mb-20 overflow-hidden">
      <div className="flex flex-col gap-6 text-center mb-12 z-20">
        <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight">
          {isHi ? "भारत की कृषि रीढ़ को जोड़ना" : "Connecting Bharat's Agricultural Backbone"}
        </h2>
        <p className="text-xl text-emerald-800/80 dark:text-emerald-200/80 max-w-3xl mx-auto leading-relaxed">
          {isHi
            ? "पंजाब के खेतों से लेकर बेंगलुरु के बाजारों तक, सारथी रियल-टाइम इंटेलिजेंस और लॉजिस्टिक्स के साथ सप्लाई चेन को जोड़ता है।"
            : "From the lush fields of Punjab to the bustling markets of Bengaluru, Sarthi unifies the supply chain with real-time intelligence and seamless logistics."}
        </p>
      </div>

      <div className="relative w-full max-w-4xl aspect-[4/3] flex items-center justify-center z-10">
        {/* Base Map Image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen grayscale contrast-125 pointer-events-none">
          <img
            src="https://lh3.googleusercontent.com/aida/ADBb0ugpoHKfkzdkkiXd5jnPGhdIbyPCvB9XBDUU51Oh-64pd8mmnDYq2XAIU3k-ESH41XsxTFKqND2hoUWE86wg70rmr0PlJP-qG9ISit4s4zLutAc6eVOuM5lNECzDNxsYsyg34wkigPNuROPOdCLjZ-5V1bgJZqX2FYj-36zaxkyjSGMuaUJzS-9cRLtxi8K8fQph3L8AwDmJajWabO6Fh1LewubNH-acWHdpwTPEf0OwspL-S8N1NXYnOWQWSslZPfkgnvPsaTfgHg"
            alt={isHi ? "भारत का विस्तृत मानचित्र" : "Detailed States Map of India"}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Labels placed meaningfully around the map */}
        <div className="absolute top-[10%] left-[5%] md:left-[15%] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-100 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transform -rotate-2 border border-emerald-200 dark:border-emerald-700 backdrop-blur-sm">
          📊 {isHi ? "लाइव मंडी भाव" : "Live Mandi Bhav"}
        </div>
        
        <div className="absolute top-[20%] right-[5%] md:right-[15%] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transform rotate-2 border border-blue-200 dark:border-blue-700 backdrop-blur-sm">
          🧠 {isHi ? "AI इनसाइट्स" : "AI Insights"}
        </div>
        
        <div className="absolute bottom-[25%] left-[5%] md:left-[20%] bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-100 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transform rotate-1 border border-orange-200 dark:border-orange-700 backdrop-blur-sm">
          🌱 {isHi ? "स्मार्ट फसल सलाह" : "Smart Crop Advisory"}
        </div>
        
        <div className="absolute bottom-[15%] right-[10%] md:right-[20%] bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transform -rotate-1 border border-purple-200 dark:border-purple-700 backdrop-blur-sm">
          🚛 {isHi ? "लॉजिस्टिक्स पहुंच" : "Logistics Access"}
        </div>

        {/* SVG Overlay for Logistics Routes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
          <path className="animate-dash" d="M315 250 Q 380 260 410 280" opacity="0.6" stroke="#059669" strokeDasharray="8 8" strokeWidth="3" fill="none"></path>
          <path className="animate-dash" d="M320 600 Q 340 700 370 820" opacity="0.4" stroke="#047857" strokeDasharray="10 10" strokeWidth="2" fill="none"></path>
        </svg>

        {/* Decorative Markers */}
        <div className="absolute top-[25%] left-[36%] z-30">
          <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">local_shipping</span>
          </div>
        </div>
        
        <div className="absolute top-[58%] left-[30%] z-30">
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-400/30 rounded-full animate-pulse-slow"></div>
            <div className="h-4 w-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
          </div>
        </div>
        
        <div className="absolute top-[82%] left-[36%] z-30">
           <div className="relative">
            <div className="absolute -inset-3 bg-emerald-600/30 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="h-4 w-4 bg-emerald-700 rounded-full border-2 border-white shadow-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMapSection;
