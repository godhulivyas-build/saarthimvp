import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { useI18n } from '../i18n/I18nContext';
import { useV2Session } from '../state/v2Session';
import LanguageSelector from './LanguageSelector';
import type { LogisticsJob, LogisticsJobStatus } from '../types';
import {
  listLogisticsJobs, acceptLogisticsJob, updateLogisticsJobStatus,
} from '../services/mvpDataService';

type Tab = 'jobs' | 'active' | 'earnings';

// Maps job step index (0-3) to LogisticsJobStatus
const STEP_TO_STATUS: LogisticsJobStatus[] = ['accepted', 'picked_up', 'in_transit', 'delivered'];

export const TransporterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAppState();
  const { lang } = useI18n();
  const { session } = useV2Session();

  const isHi = lang !== 'en';
  const tUI = (en: string, hi: string) => (isHi ? hi : en);

  const transporterName = session.name || 'Demo Driver';
  const transporterId = session.phone || 'driver-1';

  const [activeTab, setActiveTab] = useState<Tab>('jobs');

  // Data
  const [openJobs, setOpenJobs] = useState<LogisticsJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<LogisticsJob[]>([]);
  const [activeJob, setActiveJob] = useState<LogisticsJob | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Journey step (0-3 matches the 4 stepper steps)
  const [jobStep, setJobStep] = useState<0 | 1 | 2 | 3>(0);
  const [stepLoading, setStepLoading] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const refreshJobs = useCallback(async () => {
    setLoadingJobs(true);
    const all = await listLogisticsJobs();
    setOpenJobs(all.filter(j => j.status === 'open'));
    setCompletedJobs(all.filter(j => j.status === 'delivered'));
    // Restore active job if transporter has one in progress
    const inProgress = all.find(j =>
      j.acceptedByTransporterId === transporterId &&
      j.status !== 'delivered' && j.status !== 'open'
    );
    if (inProgress && !activeJob) {
      setActiveJob(inProgress);
      const stepMap: Record<string, 0 | 1 | 2 | 3> = {
        accepted: 0, picked_up: 1, in_transit: 2, delivered: 3,
      };
      setJobStep(stepMap[inProgress.status] ?? 0);
    }
    setLoadingJobs(false);
  }, [transporterId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refreshJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => { logout(); navigate('/'); };

  const handleAcceptJob = async (job: LogisticsJob) => {
    try {
      const updated = await acceptLogisticsJob(job.id, transporterId, transporterName);
      setActiveJob(updated);
      setJobStep(0);
      setActiveTab('active');
      refreshJobs();
    } catch { /* ignore */ }
  };

  const handleAdvanceStep = async () => {
    if (!activeJob || jobStep >= 3) return;
    const nextStep = (jobStep + 1) as 0 | 1 | 2 | 3;
    const newStatus = STEP_TO_STATUS[nextStep];
    setStepLoading(true);
    try {
      const updated = await updateLogisticsJobStatus(activeJob.id, newStatus);
      setActiveJob(updated);
      setJobStep(nextStep);
      if (nextStep === 3) {
        refreshJobs();
      }
    } finally {
      setStepLoading(false);
    }
  };

  const getAdvanceLabel = () => {
    if (jobStep === 0) return tUI('Mark as Loaded', '"लोड हो गया" करें');
    if (jobStep === 1) return tUI('Mark In Transit', '"रास्ते में" करें');
    if (jobStep === 2) return tUI('Mark Delivered', '"वितरित" करें');
    return tUI('Trip Completed', 'ट्रिप पूरी हुई');
  };

  const filteredOpenJobs = openJobs.filter(j => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return j.pickupLocation.toLowerCase().includes(q) || j.dropLocation.toLowerCase().includes(q) || j.crop.toLowerCase().includes(q);
  });

  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.estimatedFareInr || 0), 0);

  const STEP_LABELS = [
    tUI('Arrived at Pickup', 'पिकअप पर पहुँचे'),
    tUI('Loaded', 'लोड हो गया'),
    tUI('In Transit', 'रास्ते में'),
    tUI('Arrived at Destination', 'मंज़िल पर पहुँचे'),
  ];
  const STEP_ICONS = ['check_circle', 'local_shipping', 'near_me', 'location_on'];

  const navLinks = [
    { id: 'jobs', icon: 'search', label: tUI('Find Jobs', 'काम खोजें') },
    { id: 'active', icon: 'local_shipping', label: tUI('Active Trip', 'सक्रिय ट्रिप') },
    { id: 'earnings', icon: 'account_balance_wallet', label: tUI('Earnings', 'कमाई') },
  ];

  return (
    <div className="bg-surface font-['Lexend'] text-on-surface min-h-screen">
      {/* Top Nav */}
      <nav className="bg-[#1B4332] dark:bg-slate-950 flex justify-between items-center h-16 px-5 w-full sticky top-0 z-50 shadow-md border-b border-emerald-800/50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Sarthi" className="w-9 h-9 rounded-xl bg-white p-1" />
          <span className="text-xl font-bold text-white">Sarthi</span>
          <div className="hidden md:flex items-center gap-6 ml-6">
            {navLinks.map(link => (
              <button key={link.id} onClick={() => setActiveTab(link.id as Tab)}
                className={`text-sm font-medium transition-colors ${activeTab === link.id ? 'text-white border-b-2 border-emerald-400 pb-0.5' : 'text-emerald-100/80 hover:text-white'}`}>
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <span className="text-emerald-200 text-sm font-medium hidden sm:block">{transporterName}</span>
          <button onClick={handleLogout} className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-700/50 rounded-full transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>logout</span>
          </button>
        </div>
      </nav>

      {/* Side Nav (Desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-72 bg-white dark:bg-slate-900 flex-col py-6 border-r border-slate-200 dark:border-slate-800 z-40">
        <div className="px-6 mb-6">
          <h4 className="font-black text-emerald-900 dark:text-emerald-50 text-lg uppercase tracking-wide">{tUI('Transporter', 'ट्रांसपोर्टर')}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{transporterName}</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{tUI('Find Loads & Earn', 'लोड खोजें और कमाएं')}</p>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id as Tab)}
              className={`w-full flex items-center gap-3 cursor-pointer p-3.5 rounded-xl text-sm transition-all ${activeTab === link.id ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>{link.icon}</span>
              {link.label}
              {link.id === 'active' && activeJob && jobStep < 3 && (
                <span className="ml-auto w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">{tUI('Total Earned', 'कुल कमाई')}</p>
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">₹{totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{completedJobs.length} {tUI('trips completed', 'ट्रिप पूरी')}</p>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 p-4 md:p-6 pb-24 lg:pb-8">

        {/* ======== FIND JOBS ======== */}
        {activeTab === 'jobs' && (
          <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-800/40">
              <h1 className="text-2xl font-extrabold mb-1">{tUI('Available Jobs Near You', 'आपके आस-पास उपलब्ध काम')}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">{tUI('Find and accept transport requests from farmers.', 'किसानों से ट्रांसपोर्ट अनुरोध खोजें और स्वीकार करें।')}</p>

              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500 text-[20px]">location_on</span>
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    type="text"
                    placeholder={tUI('Search by location or crop...', 'स्थान या फसल खोजें...')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                  />
                </div>
                <button onClick={refreshJobs} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                  <span className="hidden sm:inline">{tUI('Refresh', 'रिफ्रेश')}</span>
                </button>
              </div>

              {loadingJobs ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] animate-spin text-emerald-500">refresh</span>
                </div>
              ) : filteredOpenJobs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                  <span className="material-symbols-outlined text-[56px] text-slate-300 dark:text-slate-600 block mb-2">local_shipping</span>
                  <p className="font-bold text-slate-500">{tUI('No open jobs right now.', 'अभी कोई उपलब्ध काम नहीं है।')}</p>
                  <p className="text-sm text-slate-400 mt-1">{tUI('Farmers will post when they need transport.', 'किसान ट्रांसपोर्ट की ज़रूरत होने पर पोस्ट करेंगे।')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOpenJobs.map(job => (
                    <div key={job.id} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            {job.estimatedFareInr && job.estimatedFareInr > 10000 && (
                              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">{tUI('High Pay', 'उच्च वेतन')}</span>
                            )}
                            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">{tUI('Open', 'उपलब्ध')}</span>
                            <span className="text-xs text-slate-400">#{job.id.slice(-8).toUpperCase()}</span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-4">
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">{tUI('Pickup', 'पिकअप')}</p>
                              <p className="font-bold text-lg leading-tight">{job.pickupLocation}</p>
                              <p className="text-xs text-slate-500">{job.farmerName}</p>
                            </div>
                            <div className="hidden sm:flex flex-col items-center px-3">
                              <span className="material-symbols-outlined text-emerald-400">arrow_forward</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">{tUI('Drop-off', 'ड्रॉप-ऑफ')}</p>
                              <p className="font-bold text-lg leading-tight">{job.dropLocation}</p>
                            </div>
                          </div>

                          <div className="flex gap-3 items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">inventory_2</span>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{job.crop} • {job.quantity} {job.unit}</p>
                            </div>
                            <button onClick={() => handleAcceptJob(job)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-sm active:scale-95 shrink-0">
                              {tUI('Accept Job', 'काम स्वीकार करें')}
                            </button>
                          </div>
                        </div>

                        {job.estimatedFareInr && (
                          <div className="hidden md:flex flex-col justify-center items-end border-l border-slate-200 dark:border-slate-700 pl-5 w-36 text-right shrink-0">
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">{tUI('Payout', 'भुगतान')}</p>
                            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">₹{job.estimatedFareInr.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======== ACTIVE TRIP ======== */}
        {activeTab === 'active' && (
          <>
            {!activeJob ? (
              <div className="max-w-2xl mx-auto text-center py-20 animate-in fade-in duration-300">
                <span className="material-symbols-outlined text-[80px] text-slate-200 dark:text-slate-700 block mb-4">local_shipping</span>
                <h2 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">{tUI('No active trip', 'कोई सक्रिय ट्रिप नहीं')}</h2>
                <p className="text-slate-500 dark:text-slate-500 mb-6">{tUI('Accept a job from the jobs tab to start your trip.', 'ट्रिप शुरू करने के लिए काम के टैब से जॉब स्वीकार करें।')}</p>
                <button onClick={() => setActiveTab('jobs')} className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 shadow-md transition-colors">
                  {tUI('Find Jobs', 'काम खोजें')}
                </button>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 animate-in fade-in duration-300">
                {/* Left: Route + Contacts */}
                <div className="flex-1 space-y-5">
                  {/* Trip header */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-emerald-100 dark:border-slate-800 flex flex-wrap justify-between items-end gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => setActiveTab('jobs')} className="material-symbols-outlined text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">arrow_back</button>
                        <h1 className="text-xl font-bold text-[#4f378a] dark:text-[#cfbcff]">
                          {tUI('Job', 'जॉब')} #{activeJob.id.slice(-8).toUpperCase()}
                        </h1>
                      </div>
                      <p className="text-sm text-slate-500 ml-9">{activeJob.pickupLocation} → {activeJob.dropLocation}</p>
                    </div>
                    {activeJob.estimatedFareInr && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase">{tUI('Estimated Payout', 'अनुमानित भुगतान')}</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹{activeJob.estimatedFareInr.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Map placeholder */}
                  <div className="relative bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden h-64 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <div className="text-center text-slate-400 dark:text-slate-500">
                      <span className="material-symbols-outlined text-[64px] block mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                      <p className="text-sm font-medium">{activeJob.pickupLocation} → {activeJob.dropLocation}</p>
                    </div>
                    <div className="absolute top-4 left-4 right-4 flex justify-between">
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-lg shadow border border-[#4f378a]/20">
                        <p className="text-[10px] text-[#4f378a] dark:text-[#cfbcff] font-bold uppercase">{tUI('Pickup', 'पिकअप')}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeJob.pickupLocation}</p>
                      </div>
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-lg shadow border border-emerald-500/20 text-right">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">{tUI('Destination', 'मंज़िल')}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeJob.dropLocation}</p>
                      </div>
                    </div>
                    {jobStep === 2 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <div className="bg-[#4f378a] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <span className="material-symbols-outlined text-sm animate-pulse">local_shipping</span>
                          {tUI('In Transit', 'रास्ते में')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-emerald-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-300 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>face</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{tUI('Farmer (Pickup)', 'किसान (पिकअप)')}</p>
                          <p className="text-base font-bold text-slate-900 dark:text-white">{activeJob.farmerName}</p>
                          <p className="text-xs text-slate-500">{activeJob.pickupLocation}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-10 h-10 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-600 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                        </button>
                        <button className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">call</span>
                        </button>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-emerald-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#e9ddff] dark:bg-[#4f378a]/40 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>store</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{tUI('Drop-off', 'ड्रॉप-ऑफ')}</p>
                          <p className="text-base font-bold text-slate-900 dark:text-white">{activeJob.dropLocation}</p>
                        </div>
                      </div>
                      <button className="w-10 h-10 bg-[#4f378a] text-white rounded-full flex items-center justify-center hover:bg-[#3a2865] transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Stepper + Specs */}
                <div className="w-full lg:w-96 space-y-5">
                  {/* Traffic alert when in transit */}
                  {jobStep === 2 && (
                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl flex gap-3 border border-red-200 dark:border-red-800 animate-in fade-in duration-300">
                      <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">warning</span>
                      <div>
                        <p className="text-xs text-red-800 dark:text-red-200 font-bold uppercase">{tUI('Traffic Alert', 'यातायात चेतावनी')}</p>
                        <p className="text-sm text-red-700 dark:text-red-200">{tUI('Heavy traffic on main route. Consider alternate roads.', 'मुख्य मार्ग पर भारी जाम है। वैकल्पिक मार्ग अपनाएं।')}</p>
                      </div>
                    </div>
                  )}

                  {/* Journey stepper */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-emerald-100 dark:border-slate-800 relative overflow-hidden">
                    {jobStep === 3 && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none z-0"></div>}
                    <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-900 dark:text-white relative z-10">
                      <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff]">timeline</span>
                      {tUI('Journey Status', 'यात्रा की स्थिति')}
                    </h2>
                    <div className="space-y-0 relative z-10">
                      {/* Vertical progress line */}
                      <div className="absolute left-[19px] top-10 bottom-14 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                      <div
                        className="absolute left-[19px] top-10 w-0.5 bg-[#4f378a] dark:bg-[#cfbcff] transition-all duration-700"
                        style={{ height: jobStep === 0 ? '5%' : jobStep === 1 ? '38%' : jobStep === 2 ? '69%' : '92%' }}
                      ></div>

                      {STEP_LABELS.map((label, i) => (
                        <div key={i} className="relative flex gap-4 pb-7 last:pb-0">
                          <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            jobStep > i ? 'bg-[#6750a4] text-white' :
                            jobStep === i ? 'bg-[#6750a4] text-white ring-4 ring-[#e9ddff] dark:ring-[#4f378a]/40' :
                            i === 3 && jobStep === 3 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}>
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>{STEP_ICONS[i]}</span>
                          </div>
                          <div className="pt-1.5">
                            <p className={`text-base font-semibold ${jobStep >= i ? (i === 3 && jobStep === 3 ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#4f378a] dark:text-[#cfbcff]') : 'text-slate-400'}`}>{label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {jobStep > i ? tUI('Completed', 'पूरा हुआ') :
                               jobStep === i ? (i === 3 ? tUI('Just delivered!', 'अभी वितरित हुआ!') : tUI('Current step', 'वर्तमान चरण')) :
                               tUI('Pending', 'बाकी है')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {jobStep < 3 ? (
                      <button onClick={handleAdvanceStep} disabled={stepLoading} className="mt-6 w-full bg-[#4f378a] hover:bg-[#3a2865] text-white py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 relative z-10">
                        {stepLoading
                          ? <span className="material-symbols-outlined animate-spin">refresh</span>
                          : <><span>{getAdvanceLabel()}</span><span className="material-symbols-outlined">arrow_forward</span></>
                        }
                      </button>
                    ) : (
                      <div className="mt-6 w-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-700 relative z-10">
                        <span className="material-symbols-outlined text-emerald-600">verified</span>
                        {tUI('Payout Initiated ✓', 'भुगतान शुरू किया गया ✓')}
                      </div>
                    )}
                  </div>

                  {/* Cargo specs */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-base font-bold mb-4 text-slate-900 dark:text-white">{tUI('Cargo Specifications', 'कार्गो विवरण')}</h3>
                    <div className="space-y-3">
                      {[
                        { icon: 'inventory_2', label: tUI('Cargo', 'कार्गो'), val: activeJob.crop },
                        { icon: 'weight', label: tUI('Quantity', 'मात्रा'), val: `${activeJob.quantity} ${activeJob.unit}` },
                        { icon: 'person', label: tUI('Farmer', 'किसान'), val: activeJob.farmerName },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#4f378a] dark:text-[#cfbcff] text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>{row.icon}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{row.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ======== EARNINGS ======== */}
        {activeTab === 'earnings' && (
          <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">
            {/* Earnings summary */}
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-950 rounded-3xl p-7 text-white shadow-lg">
              <h2 className="text-base font-bold text-emerald-200 mb-1">{tUI('Total Earnings', 'कुल कमाई')}</h2>
              <p className="text-5xl font-black mb-4">₹{totalEarnings.toLocaleString()}</p>
              <div className="flex gap-5">
                <div className="bg-white/15 rounded-2xl p-4 flex-1 text-center">
                  <p className="text-2xl font-black">{completedJobs.length}</p>
                  <p className="text-xs text-emerald-200 font-bold uppercase">{tUI('Trips Done', 'ट्रिप पूरी')}</p>
                </div>
                <div className="bg-white/15 rounded-2xl p-4 flex-1 text-center">
                  <p className="text-2xl font-black">
                    {completedJobs.length > 0 ? `₹${Math.round(totalEarnings / completedJobs.length).toLocaleString()}` : '₹0'}
                  </p>
                  <p className="text-xs text-emerald-200 font-bold uppercase">{tUI('Avg / Trip', 'प्रति ट्रिप')}</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-extrabold">{tUI('Completed Trips', 'पूरी हुई ट्रिप्स')}</h2>
            {completedJobs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[56px] text-slate-200 dark:text-slate-700 block mb-2">local_shipping</span>
                <p className="font-bold text-slate-500">{tUI('No completed trips yet.', 'अभी कोई पूरी ट्रिप नहीं।')}</p>
                <p className="text-sm text-slate-400 mt-1">{tUI('Accept and complete jobs to see your earnings here.', 'जॉब स्वीकार करें और कमाई यहाँ देखें।')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedJobs.map(job => (
                  <div key={job.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-300 text-[22px]">local_shipping</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{job.pickupLocation} → {job.dropLocation}</p>
                        <p className="text-xs text-slate-500">{job.crop} • {job.quantity} {job.unit} • {job.farmerName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">#{job.id.slice(-8).toUpperCase()} • {new Date(job.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">₹{(job.estimatedFareInr || 0).toLocaleString()}</p>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">{tUI('Delivered', 'वितरित')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] h-16 flex items-center justify-around z-50 border-t border-slate-100 dark:border-slate-800 px-4">
        {navLinks.map(link => (
          <button key={link.id} onClick={() => setActiveTab(link.id as Tab)}
            className={`relative flex flex-col items-center gap-0.5 cursor-pointer transition-all ${activeTab === link.id ? 'text-[#4f378a] dark:text-[#cfbcff]' : 'text-slate-500 dark:text-slate-400'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === link.id ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}>{link.icon}</span>
            <span className={`text-[10px] ${activeTab === link.id ? 'font-bold' : 'font-medium'}`}>{link.label}</span>
            {link.id === 'active' && activeJob && jobStep < 3 && (
              <span className="absolute -top-0.5 right-0 w-2 h-2 bg-amber-400 rounded-full"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
