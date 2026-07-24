import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { useI18n } from '../i18n/I18nContext';
import LanguageSelector from './LanguageSelector';

export const TransporterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAppState();
  const { lang } = useI18n();

  const isHi = lang !== 'en';
  const tUI = (en: string, hi: string) => isHi ? hi : en;

  const [activeTab, setActiveTab] = useState<'jobs' | 'active'>('jobs');
  const [jobStatus, setJobStatus] = useState<0 | 1 | 2 | 3>(0); // 0: Pickup, 1: Loaded, 2: Transit, 3: Delivered
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAcceptJob = () => {
    setActiveTab('active');
    setJobStatus(0);
  };

  const advanceStatus = () => {
    if (jobStatus < 3) setJobStatus(prev => (prev + 1) as 0 | 1 | 2 | 3);
  };

  const getStatusText = () => {
    if (jobStatus === 0) return tUI('Update to "Loaded"', '"लोड हो गया" अपडेट करें');
    if (jobStatus === 1) return tUI('Update to "In Transit"', '"रास्ते में" अपडेट करें');
    if (jobStatus === 2) return tUI('Update to "Delivered"', '"वितरित हो गया" अपडेट करें');
    return tUI('Trip Completed', 'ट्रिप पूरी हुई');
  };

  return (
    <div className="bg-surface font-['Lexend'] text-on-surface min-h-screen">
      {/* Top Navigation */}
      <nav className="bg-[#1B4332] dark:bg-slate-950 flex justify-between items-center h-20 px-6 w-full sticky top-0 z-50 shadow-md border-b border-emerald-800/50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white cursor-pointer mr-2" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>arrow_back</span>
          <img src="/logo.png" alt="Sarthi Logo" className="w-10 h-10 rounded-xl shadow-sm bg-white p-1" />
          <span className="text-2xl font-bold text-white tracking-tight">Sarthi</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a onClick={() => setActiveTab('jobs')} className={`cursor-pointer ${activeTab === 'jobs' ? 'text-white border-b-2 border-emerald-400 pb-1' : 'text-emerald-100/80 hover:text-white'} text-base font-medium transition-colors`}>{tUI('Find Jobs', 'काम खोजें')}</a>
          <a onClick={() => setActiveTab('active')} className={`cursor-pointer ${activeTab === 'active' ? 'text-white border-b-2 border-emerald-400 pb-1' : 'text-emerald-100/80 hover:text-white'} text-base font-medium transition-colors`}>{tUI('Active Trip', 'सक्रिय ट्रिप')}</a>
          <a className="text-emerald-100/80 hover:text-white text-base font-medium transition-colors" href="#">{tUI('Earnings', 'कमाई')}</a>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <span className="material-symbols-outlined text-emerald-400 cursor-pointer" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>notifications</span>
          <span className="material-symbols-outlined text-emerald-400 cursor-pointer" onClick={handleLogout} style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>account_circle</span>
        </div>
      </nav>

      {/* Side Navigation Shell */}
      <aside className="hidden lg:flex fixed left-0 top-20 h-[calc(100vh-80px)] w-72 bg-white dark:bg-slate-900 flex-col py-6 border-r border-slate-200 dark:border-slate-800 z-40">
        <div className="px-6 mb-8">
          <h4 className="font-black text-emerald-900 dark:text-emerald-50 text-xl tracking-wide uppercase">{tUI('Transporter', 'ट्रांसपोर्टर')}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{tUI('Find Loads & Earn', 'लोड खोजें और कमाएं')}</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a onClick={() => setActiveTab('jobs')} className={`flex items-center gap-3 cursor-pointer p-4 mx-2 rounded-lg text-sm transition-all ${activeTab === 'jobs' ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>search</span> {tUI('Find Jobs', 'काम खोजें')}
          </a>
          <a onClick={() => setActiveTab('active')} className={`flex items-center gap-3 cursor-pointer p-4 mx-2 rounded-lg text-sm transition-all ${activeTab === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>local_shipping</span> {tUI('Active Trip', 'सक्रिय ट्रिप')}
          </a>
          <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 p-4 mx-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:translate-x-1 transition-all rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>account_balance_wallet</span> {tUI('Earnings', 'कमाई')}
          </a>
          <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 p-4 mx-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:translate-x-1 transition-all rounded-lg text-sm cursor-pointer">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>history</span> {tUI('Trip History', 'ट्रिप इतिहास')}
          </a>
        </nav>
        <div className="px-2 mt-auto">
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-1">
            <a onClick={handleLogout} className="flex items-center gap-3 text-slate-500 dark:text-slate-400 p-2 mx-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-sm cursor-pointer">
              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>logout</span> {tUI('Logout', 'लॉग आउट')}
            </a>
          </div>
        </div>
      </aside>

      <main className="max-w-7xl mx-auto p-4 md:p-8 lg:ml-72 flex flex-col lg:flex-row gap-6 pb-24 lg:pb-8 pt-6">
        
        {activeTab === 'jobs' && (
          <div className="flex-1 space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-emerald-100 dark:border-emerald-800/30">
              <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950 dark:text-white mb-2">{tUI('Available Jobs Near You', 'आपके आस-पास उपलब्ध काम')}</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{tUI('Find and accept transport requests from farmers.', 'किसानों से परिवहन अनुरोध खोजें और स्वीकार करें।')}</p>
              
              {/* Search with mic */}
              <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500">location_on</span>
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text" 
                    placeholder={tUI('Search pickup location or crop...', 'पिकअप स्थान या फसल खोजें...')} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-xl py-3 pl-12 pr-12 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-medium" 
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 hover:scale-110 active:scale-95 transition-all bg-emerald-100 dark:bg-emerald-900 p-1.5 rounded-lg">mic</button>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md hidden sm:flex items-center gap-2">
                  <span className="material-symbols-outlined">filter_list</span>
                  {tUI('Filters', 'फ़िल्टर')}
                </button>
              </div>

              {/* Job Listings */}
              <div className="space-y-4">
                {/* Job 1 */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">{tUI('Urgent • High Pay', 'ज़रूरी • उच्च वेतन')}</div>
                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 md:hidden">₹14,500</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-4">
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{tUI('Pickup', 'पिकअप')}</p>
                          <p className="font-semibold text-lg text-slate-900 dark:text-white">{tUI('Ludhiana Farms', 'लुधियाना फार्म्स')}</p>
                          <p className="text-sm text-slate-500">Sector 14</p>
                        </div>
                        <div className="hidden sm:flex flex-col items-center px-4">
                          <span className="text-xs text-emerald-600 font-bold">12.4 km</span>
                          <span className="material-symbols-outlined text-emerald-300">arrow_forward</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{tUI('Drop-off', 'ड्रॉप-ऑफ़')}</p>
                          <p className="font-semibold text-lg text-slate-900 dark:text-white">{tUI('GreenBazaar Hub', 'ग्रीनबाज़ार हब')}</p>
                          <p className="text-sm text-slate-500">Chandigarh Market</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff]">inventory_2</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{tUI('Basmati Rice', 'बासमती चावल')} • 1,250 kg</p>
                          <p className="text-xs text-slate-500">{tUI('Requires Large Truck', 'बड़े ट्रक की आवश्यकता है')}</p>
                        </div>
                        <button onClick={handleAcceptJob} className="bg-[#4f378a] hover:bg-[#3a2865] text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md active:scale-95">
                          {tUI('Accept Job', 'काम स्वीकार करें')}
                        </button>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col justify-center items-end border-l border-slate-200 dark:border-slate-700 pl-6 w-40 text-right">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">{tUI('Payout', 'भुगतान')}</p>
                      <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-2">₹14,500</p>
                      <p className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md">{tUI('Est. time: 3 hrs', 'अनुमानित समय: 3 घंटे')}</p>
                    </div>
                  </div>
                </div>

                {/* Job 2 */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all opacity-80">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">{tUI('Shared Load', 'साझा लोड')}</div>
                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 md:hidden">₹4,200</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-4">
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{tUI('Pickup', 'पिकअप')}</p>
                          <p className="font-semibold text-lg text-slate-900 dark:text-white">{tUI('Sharma Farm', 'शर्मा फार्म')}</p>
                          <p className="text-sm text-slate-500">Village Khedi</p>
                        </div>
                        <div className="hidden sm:flex flex-col items-center px-4">
                          <span className="text-xs text-emerald-600 font-bold">45 km</span>
                          <span className="material-symbols-outlined text-emerald-300">arrow_forward</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{tUI('Drop-off', 'ड्रॉप-ऑफ़')}</p>
                          <p className="font-semibold text-lg text-slate-900 dark:text-white">{tUI('Indore Mandi', 'इंदौर मंडी')}</p>
                          <p className="text-sm text-slate-500">Gate No. 2</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff]">inventory_2</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{tUI('Soybean', 'सोयाबीन')} • 800 kg</p>
                          <p className="text-xs text-slate-500">{tUI('Mini Truck suitable', 'मिनी ट्रक उपयुक्त')}</p>
                        </div>
                        <button onClick={handleAcceptJob} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold py-2 px-6 rounded-xl transition-all hover:bg-emerald-500 hover:text-white">
                          {tUI('Accept Job', 'काम स्वीकार करें')}
                        </button>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col justify-center items-end border-l border-slate-200 dark:border-slate-700 pl-6 w-40 text-right">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">{tUI('Payout', 'भुगतान')}</p>
                      <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-2">₹4,200</p>
                      <p className="text-xs text-slate-500 font-medium">{tUI('Est. time: 1.5 hrs', 'अनुमानित समय: 1.5 घंटे')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <>
            {/* Left Column: Map and Journey Details */}
            <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Header Section */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-emerald-100 dark:border-slate-800 flex flex-wrap justify-between items-end gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <button onClick={() => setActiveTab('jobs')} className="material-symbols-outlined text-slate-400 hover:text-slate-700 transition-colors">arrow_back</button>
                    <h1 className="text-2xl font-semibold text-[#4f378a] dark:text-[#cfbcff]">{tUI('Booking #TX-99210', 'बुकिंग #TX-99210')}</h1>
                  </div>
                  <p className="text-base text-[#494551] dark:text-slate-400 flex items-center gap-2 ml-9">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>calendar_today</span> {tUI('Oct 24, 2026 • 08:45 AM', '२४ अक्टूबर, २०२६ • ०८:४५ सुबह')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-[#7a7582] uppercase tracking-widest">{tUI('Estimated Payout', 'अनुमानित भुगतान')}</p>
                  <p className="text-2xl font-semibold text-[#765b00] dark:text-[#e7c365]">₹14,500.00</p>
                </div>
              </div>

              {/* Route Map Container */}
              <div className="relative bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm h-[400px] border border-slate-200 dark:border-slate-700">
                <img className="w-full h-full object-cover opacity-80" alt="Route Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa7PODvu5f2XbFMZkGBbLHddAy5xIgNkeMfD5oG45AaB8tqZdDDRr_cSVIct381QNA8zWMFx9PUllrkVU8UjIJWeOaMHkSd9Nufa6UEyxft5Jg5mk8F8GMm4A-ROh6Z889ORHLUu_NMhcDlnN68UgUlrtrZyahBqA6qOYZvXozfDqh4Ge_UF-PJn1eXpyYlPOdqSYdkg0E6GvPZLH-q-cMEhM27YQ1Two9b1BRscrSgQ6dOPErjT1_zrsgiI6PGXDHhl_jehK5SQw"/>
                
                {/* Map Overlay Elements */}
                <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-[#4f378a]/20 pointer-events-auto">
                    <p className="text-[12px] text-[#4f378a] dark:text-[#cfbcff] font-bold">{tUI('CURRENT LOCATION', 'वर्तमान स्थान')}</p>
                    <p className="text-base text-slate-900 dark:text-white">{jobStatus < 2 ? tUI('Sector 14, Ludhiana', 'सेक्टर १४, लुधियाना') : tUI('Highway NH44', 'राजमार्ग NH44')}</p>
                  </div>
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-[#765b00]/20 pointer-events-auto text-right">
                    <p className="text-[12px] text-[#765b00] dark:text-[#e7c365] font-bold">{tUI('REMAINING', 'शेष')}</p>
                    <p className="text-base text-slate-900 dark:text-white">{jobStatus === 3 ? tUI('Arrived', 'पहुंच गए') : tUI('12.4 km (24 mins)', '१२.४ किमी (२४ मिनट)')}</p>
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#4f378a] text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>local_shipping</span>
                  </div>
                </div>
              </div>

              {/* Coordination Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Farmer Contact */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-emerald-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-100" alt="Farmer Contact" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANqA4GHEdj1CfArECW0DVyo82y2pXITLwZ8p2dga6cJ6lggUqgz8Tch-twcE9OLM1B9AX09zTQvObiQh1Yi3Tun8WTLj5C3BEz6ctO4X8Hzv86EEbBE_-I12hcY05rWH9sCIloJtDtpyS0YSJT30SDw2ygPMqZDd4j38jisLKHBfInaUTbTQQz7McLB2dQqWGYmRbiMrEZB7icvxm2njP134-Tgp4EagsBjG6h5dzTsyfD8Egy6bno3MI11pK1cX01AxicFenDYgU"/>
                    <div>
                      <p className="text-[12px] text-[#7a7582] uppercase">{tUI('Pickup Contact', 'पिकअप संपर्क')}</p>
                      <p className="text-[20px] font-semibold text-slate-900 dark:text-white">{tUI('Rajesh Kumar', 'राजेश कुमार')}</p>
                      <p className="text-base text-[#494551] dark:text-slate-400">{tUI('Ludhiana Farms', 'लुधियाना फार्म्स')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-12 h-12 bg-white border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-50 transition-colors shadow-sm">
                      <span className="material-symbols-outlined">chat</span>
                    </button>
                    <button className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md">
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>call</span>
                    </button>
                  </div>
                </div>
                
                {/* Buyer Contact */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-emerald-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img className="w-14 h-14 rounded-full object-cover ring-2 ring-[#cfbcff]" alt="Buyer Contact" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtGnkKN3KePWrCDIZtjeZWd_C3k6HfA4RJNOVh4EPiWocMshmHI54F0Qt2KRXrhqSJrycI5_74nQ1Grm1hrpIz0_lT-unos_HGdyTodmYGpLk5HQf62PkJh2DuDznmyoCHTwmuM2FAuFtdGdFnKBsPMoYYbXsXgV9EERObKaysES4ANhjZf6vXf4Wi4mtcoDuRRzWdVOXHzXx6dXmDwmEJTpz31KDYFbYM3FIv6CsHZDueAJX4kiU-WE6cjzK-xoMl77FURZWkAgo"/>
                    <div>
                      <p className="text-[12px] text-[#7a7582] uppercase">{tUI('Drop-off Contact', 'ड्रॉप-ऑफ़ संपर्क')}</p>
                      <p className="text-[20px] font-semibold text-slate-900 dark:text-white">{tUI('Anita Sharma', 'अनीता शर्मा')}</p>
                      <p className="text-base text-[#494551] dark:text-slate-400">{tUI('GreenBazaar Hub', 'ग्रीनबाज़ार हब')}</p>
                    </div>
                  </div>
                  <button className="w-12 h-12 bg-[#4f378a] text-white rounded-full flex items-center justify-center hover:bg-[#22005d] transition-colors shadow-md">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>call</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Status & Shipment Details */}
            <div className="w-full lg:w-96 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              {/* Urgent Notification */}
              {jobStatus === 2 && (
                <div className="bg-[#ffdad6] dark:bg-red-900/30 p-4 rounded-xl flex gap-3 border border-[#ba1a1a]/20">
                  <span className="material-symbols-outlined text-[#ba1a1a] dark:text-red-400" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>warning</span>
                  <div>
                    <p className="text-[12px] text-[#93000a] dark:text-red-200 font-bold">{tUI('TRAFFIC ALERT', 'यातायात चेतावनी')}</p>
                    <p className="text-base text-[#93000a] dark:text-red-200">{tUI('Heavy congestion on NH44. Rerouting suggested to save 15 mins.', 'NH44 पर भारी जाम। 15 मिनट बचाने के लिए रूट बदलने का सुझाव दिया जाता है।')}</p>
                  </div>
                </div>
              )}

              {/* Update Status Stepper Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-emerald-100 dark:border-slate-800 relative overflow-hidden">
                {jobStatus === 3 && (
                  <div className="absolute inset-0 bg-emerald-500/10 z-0 pointer-events-none"></div>
                )}
                <h2 className="text-[20px] font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white relative z-10">
                  <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>timeline</span>
                  {tUI('Journey Status', 'यात्रा की स्थिति')}
                </h2>
                <div className="space-y-0 relative z-10">
                  {/* Vertical Line Connector */}
                  <div className="absolute left-[19px] top-4 bottom-10 w-0.5 bg-[#e6e0e9] dark:bg-slate-700"></div>
                  <div className="absolute left-[19px] top-4 w-0.5 bg-[#4f378a] dark:bg-[#cfbcff] transition-all duration-700" style={{ height: jobStatus === 0 ? '10%' : jobStatus === 1 ? '40%' : jobStatus === 2 ? '70%' : '100%' }}></div>
                  
                  {/* Step 0: Arrived at Pickup */}
                  <div className="relative flex gap-4 pb-8">
                    <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${jobStatus >= 0 ? 'bg-[#6750a4] text-white' : 'bg-[#e6e0e9] dark:bg-slate-800 text-[#7a7582]'}`}>
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>check_circle</span>
                    </div>
                    <div>
                      <p className={`text-[20px] font-semibold ${jobStatus >= 0 ? 'text-[#4f378a] dark:text-[#cfbcff]' : 'text-[#7a7582]'}`}>{tUI('Arrived at Pickup', 'पिकअप पर पहुँच गए')}</p>
                      <p className="text-base text-[#494551] dark:text-slate-400">{jobStatus >= 0 ? tUI('Completed at 09:15 AM', 'सुबह 09:15 बजे पूरा हुआ') : tUI('Pending action', 'कार्रवाई लंबित है')}</p>
                    </div>
                  </div>
                  
                  {/* Step 1: Loaded */}
                  <div className="relative flex gap-4 pb-8">
                    <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${jobStatus >= 1 ? 'bg-[#6750a4] text-white' : 'bg-[#e6e0e9] dark:bg-slate-800 text-[#7a7582]'} ${jobStatus === 1 ? 'ring-4 ring-[#e9ddff] dark:ring-[#4f378a]/30' : ''}`}>
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>local_shipping</span>
                    </div>
                    <div>
                      <p className={`text-[20px] font-semibold ${jobStatus >= 1 ? 'text-[#4f378a] dark:text-[#cfbcff]' : 'text-[#7a7582]'}`}>{tUI('Loaded', 'लोड हो गया')}</p>
                      <p className="text-base text-[#494551] dark:text-slate-400">{jobStatus >= 1 ? tUI('Completed at 10:02 AM', 'सुबह 10:02 बजे पूरा हुआ') : tUI('Pending action', 'कार्रवाई लंबित है')}</p>
                    </div>
                  </div>
                  
                  {/* Step 2: In Transit */}
                  <div className="relative flex gap-4 pb-8">
                    <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${jobStatus >= 2 ? 'bg-[#6750a4] text-white' : 'bg-[#e6e0e9] dark:bg-slate-800 text-[#7a7582]'} ${jobStatus === 2 ? 'ring-4 ring-[#e9ddff] dark:ring-[#4f378a]/30' : ''}`}>
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>near_me</span>
                    </div>
                    <div>
                      <p className={`text-[20px] font-semibold ${jobStatus >= 2 ? 'text-[#4f378a] dark:text-[#cfbcff]' : 'text-[#7a7582]'}`}>{tUI('In Transit', 'रास्ते में')}</p>
                      <p className="text-base text-[#494551] dark:text-slate-400">{jobStatus >= 2 ? tUI('Ongoing - On NH44', 'जारी है - NH44 पर') : tUI('Pending action', 'कार्रवाई लंबित है')}</p>
                    </div>
                  </div>
                  
                  {/* Step 3: Arrived at Destination */}
                  <div className="relative flex gap-4">
                    <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${jobStatus >= 3 ? 'bg-emerald-600 text-white' : 'bg-[#e6e0e9] dark:bg-slate-800 text-[#7a7582]'} ${jobStatus === 3 ? 'ring-4 ring-emerald-100 dark:ring-emerald-900/30' : ''}`}>
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>location_on</span>
                    </div>
                    <div>
                      <p className={`text-[20px] font-semibold ${jobStatus >= 3 ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#7a7582]'}`}>{tUI('Arrived at Destination', 'मंज़िल पर पहुँच गए')}</p>
                      <p className="text-base text-[#494551] dark:text-slate-400">{jobStatus >= 3 ? tUI('Delivered successfully', 'सफलतापूर्वक वितरित') : tUI('Pending action', 'कार्रवाई लंबित है')}</p>
                    </div>
                  </div>
                </div>
                
                {jobStatus < 3 ? (
                  <button onClick={advanceStatus} className="mt-8 w-full bg-[#4f378a] text-white py-4 rounded-xl text-[20px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 relative z-10">
                    {getStatusText()}
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>arrow_forward</span>
                  </button>
                ) : (
                  <div className="mt-8 w-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 py-4 rounded-xl text-[20px] font-semibold flex items-center justify-center gap-2 relative z-10 border border-emerald-200">
                    <span className="material-symbols-outlined text-emerald-600">verified</span>
                    {tUI('Payout Initiated', 'भुगतान शुरू किया गया')}
                  </div>
                )}
              </div>

              {/* Shipment Specs */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-emerald-100 dark:border-slate-700">
                <h3 className="text-[20px] font-semibold mb-4 text-slate-900 dark:text-white">{tUI('Cargo Specifications', 'कार्गो विवरण')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>inventory_2</span>
                      <span className="text-base text-[#494551] dark:text-slate-300">{tUI('Cargo Type', 'कार्गो प्रकार')}</span>
                    </div>
                    <span className="text-[20px] font-semibold text-slate-900 dark:text-white">{tUI('Basmati Rice', 'बासमती चावल')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>weight</span>
                      <span className="text-base text-[#494551] dark:text-slate-300">{tUI('Total Weight', 'कुल वजन')}</span>
                    </div>
                    <span className="text-[20px] font-semibold text-slate-900 dark:text-white">1,250 kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>calendar_clock</span>
                      <span className="text-base text-[#494551] dark:text-slate-300">{tUI('Expected Delivery', 'डिलीवरी का समय')}</span>
                    </div>
                    <span className="text-[20px] font-semibold text-[#ba1a1a] dark:text-red-400">{tUI('Today, 4:00 PM', 'आज, शाम 4:00 बजे')}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] h-16 flex items-center justify-around z-50 border-t border-slate-100 dark:border-slate-800 px-4 pb-safe">
        <div onClick={() => setActiveTab('jobs')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'jobs' ? 'text-[#4f378a] dark:text-[#cfbcff]' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'jobs' ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400"}}>search</span>
          <span className={`text-[10px] ${activeTab === 'jobs' ? 'font-bold' : ''}`}>{tUI('Jobs', 'काम')}</span>
        </div>
        <div onClick={() => setActiveTab('active')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'active' ? 'text-[#4f378a] dark:text-[#cfbcff]' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'active' ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400"}}>local_shipping</span>
          <span className={`text-[10px] ${activeTab === 'active' ? 'font-bold' : ''}`}>{tUI('Active', 'सक्रिय')}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-slate-500 dark:text-slate-400 cursor-pointer">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>account_balance_wallet</span>
          <span className="text-[10px]">{tUI('Wallet', 'वॉलेट')}</span>
        </div>
      </nav>
    </div>
  );
};
