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

const STEP_TO_STATUS: LogisticsJobStatus[] = ['accepted', 'picked_up', 'in_transit', 'delivered'];

function seedDistance(id: string): number {
  const n = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (n % 28) + 3;
}

function calcFare(baseRs: number, distKm: number, quantityTons: number) {
  const base = baseRs;
  const distCharge = Math.round(distKm * 22);
  const loadCharge = Math.round(quantityTons * 180);
  return { base, distCharge, loadCharge, total: base + distCharge + loadCharge };
}

function trackingCode(id: string): string {
  return id.slice(-6).toUpperCase();
}

function cropIcon(crop: string): string {
  const map: Record<string, string> = {
    Wheat: 'grass', Rice: 'eco', Soybean: 'spa', Onion: 'nutrition',
    Tomato: 'nutrition', Potato: 'nutrition', Cotton: 'local_florist',
    Maize: 'grass', Garlic: 'spa', Lentil: 'spa',
  };
  return map[crop] ?? 'inventory_2';
}

export const TransporterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAppState();
  const { lang } = useI18n();
  const { session } = useV2Session();

  const isHi = lang !== 'en';
  const tUI = (en: string, hi: string) => (isHi ? hi : en);

  const transporterName = session.name || 'Ramesh Driver';
  const transporterId = session.phone || 'driver-1';
  const driverLocation = session.addressLabel || 'Indore Mandi Area, MP';

  const [activeTab, setActiveTab] = useState<Tab>('jobs');
  const [isOnline, setIsOnline] = useState(true);

  const [openJobs, setOpenJobs] = useState<LogisticsJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<LogisticsJob[]>([]);
  const [activeJob, setActiveJob] = useState<LogisticsJob | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [jobStep, setJobStep] = useState<0 | 1 | 2 | 3>(0);
  const [stepLoading, setStepLoading] = useState(false);

  const [liveShareOn, setLiveShareOn] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshJobs = useCallback(async () => {
    setLoadingJobs(true);
    const all = await listLogisticsJobs();
    setOpenJobs(all.filter(j => j.status === 'open'));
    setCompletedJobs(all.filter(j => j.status === 'delivered'));
    const inProgress = all.find(j =>
      j.acceptedByTransporterId === transporterId &&
      j.status !== 'delivered' && j.status !== 'open'
    );
    if (inProgress && !activeJob) {
      setActiveJob(inProgress);
      const stepMap: Record<string, 0 | 1 | 2 | 3> = { accepted: 0, picked_up: 1, in_transit: 2, delivered: 3 };
      setJobStep(stepMap[inProgress.status] ?? 0);
    }
    setLoadingJobs(false);
  }, [transporterId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refreshJobs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    setStepLoading(true);
    try {
      const updated = await updateLogisticsJobStatus(activeJob.id, STEP_TO_STATUS[nextStep]);
      setActiveJob(updated);
      setJobStep(nextStep);
      if (nextStep === 3) refreshJobs();
    } finally { setStepLoading(false); }
  };

  const filteredOpenJobs = openJobs.filter(j => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return j.pickupLocation.toLowerCase().includes(q) || j.dropLocation.toLowerCase().includes(q) || j.crop.toLowerCase().includes(q);
  });

  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.estimatedFareInr || 0), 0);

  const getAdvanceCTA = () => {
    if (jobStep === 0) return tUI('Mark as Arrived at Pickup', 'पिकअप पर पहुँचे');
    if (jobStep === 1) return tUI('Mark as Loaded ✓', 'लोड हो गया ✓');
    if (jobStep === 2) return tUI('Mark as Delivered ✓', 'डिलीवर हो गया ✓');
    return tUI('Trip Completed', 'ट्रिप पूरी');
  };

  const STEP_LABELS = [
    tUI('Arrived at Pickup', 'पिकअप पर पहुँचे'),
    tUI('Cargo Loaded', 'माल लोड हुआ'),
    tUI('In Transit', 'रास्ते में'),
    tUI('Delivered', 'डिलीवर हुआ'),
  ];

  const NAV: { id: Tab; icon: string; label: string }[] = [
    { id: 'jobs', icon: 'local_shipping', label: tUI('Jobs', 'काम') },
    { id: 'active', icon: 'navigation', label: tUI('Active Trip', 'ट्रिप') },
    { id: 'earnings', icon: 'payments', label: tUI('Earnings', 'कमाई') },
  ];

  return (
    <div className="bg-[#f9f9f8] font-['Lexend'] text-[#191c1c] min-h-screen">

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-white border-b border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e1e3e2] overflow-hidden border border-[#c1c8c2] shrink-0">
            <div className="w-full h-full flex items-center justify-center bg-[#1b4332]">
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          </div>
          <span className="text-xl font-black text-[#012d1d] tracking-tight uppercase">SARTHI</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <button
            onClick={() => setIsOnline(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-stone-100 border-stone-300 text-stone-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
            {isOnline ? tUI('ONLINE', 'ऑनलाइन') : tUI('OFFLINE', 'ऑफलाइन')}
          </button>
          <button onClick={handleLogout} className="w-9 h-9 rounded-full text-stone-500 hover:bg-stone-100 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <main className="pt-16 pb-24">

        {/* ══════════ FIND JOBS ══════════ */}
        {activeTab === 'jobs' && (
          <div>
            {/* Map background */}
            <section className="relative w-full h-[260px] bg-[#edeeed] overflow-hidden">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background: 'linear-gradient(135deg, #4a7c59 0%, #5d8f6e 25%, #6ba378 50%, #4f7a62 75%, #3d6b50 100%)',
                  backgroundImage: `
                    radial-gradient(circle at 20% 30%, rgba(27,67,50,0.6) 0%, transparent 40%),
                    radial-gradient(circle at 80% 60%, rgba(14,108,74,0.4) 0%, transparent 45%),
                    radial-gradient(circle at 50% 80%, rgba(1,45,29,0.3) 0%, transparent 35%)
                  `,
                }}
              />
              {/* Road lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 260" preserveAspectRatio="none">
                <path d="M 0,200 Q 100,180 200,150 Q 300,120 400,100" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                <path d="M 0,200 Q 100,180 200,150 Q 300,120 400,100" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeDasharray="20,10" />
                <path d="M 50,0 Q 80,80 120,150 Q 160,220 180,260" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
              </svg>
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, #f9f9f8 100%)' }} />

              {/* Job pins */}
              <div className="absolute top-[30%] left-[25%]">
                <div className="bg-[#012d1d] text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                </div>
              </div>
              <div className="absolute top-[50%] right-[30%]">
                <div className="bg-[#012d1d] text-white p-2 rounded-full shadow-lg border-2 border-white">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                </div>
              </div>

              {/* Current location pulse */}
              <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-[#0e6c4a]/20 rounded-full animate-ping" />
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[#0e6c4a]">
                    <div className="w-2.5 h-2.5 bg-[#0e6c4a] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Location float */}
              <div className="absolute bottom-10 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg border border-white/50">
                  <span className="material-symbols-outlined text-[#0e6c4a] text-[20px]">my_location</span>
                  <span className="text-sm font-bold text-[#191c1c] flex-1 truncate">{driverLocation}</span>
                  <button onClick={() => setIsOnline(v => !v)} className="sm:hidden">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Bottom sheet */}
            <section className="relative z-10 bg-white rounded-t-[28px] -mt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] min-h-[60vh]">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#c1c8c2]" />
              </div>

              <div className="px-5 pt-3 pb-6 space-y-4">
                {/* Header row */}
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-[22px] font-extrabold text-[#012d1d]">{tUI('Available Jobs', 'उपलब्ध काम')}</h2>
                    <p className="text-sm text-[#414844] mt-0.5">
                      {loadingJobs
                        ? tUI('Loading…', 'लोड हो रहा…')
                        : `${filteredOpenJobs.length} ${tUI('nearby requests found', 'पास के अनुरोध मिले')}`}
                    </p>
                  </div>
                  <button
                    onClick={refreshJobs}
                    className="w-9 h-9 rounded-full border border-[#c1c8c2] flex items-center justify-center hover:bg-[#edeeed] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#414844]">refresh</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#717973] text-[18px]">search</span>
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={tUI('Search crop, pickup or drop…', 'फसल, पिकअप या मंज़िल खोजें…')}
                    className="w-full bg-[#f3f4f3] border border-[#c1c8c2] rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#0e6c4a] font-medium"
                  />
                </div>

                {/* Offline warning */}
                {!isOnline && (
                  <div className="bg-[#e7e8e7] border border-[#c1c8c2] rounded-2xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#414844] text-[20px]">wifi_off</span>
                    <p className="text-sm font-medium text-[#414844]">
                      {tUI("You're offline. Go online to accept jobs.", "आप ऑफलाइन हैं। काम के लिए ऑनलाइन जाएं।")}
                    </p>
                  </div>
                )}

                {/* Job list */}
                {loadingJobs ? (
                  <div className="text-center py-16">
                    <span className="material-symbols-outlined text-[48px] animate-spin text-[#0e6c4a]">refresh</span>
                  </div>
                ) : filteredOpenJobs.length === 0 ? (
                  <div className="text-center py-16 bg-[#f3f4f3] rounded-2xl border border-dashed border-[#c1c8c2]">
                    <span className="material-symbols-outlined text-[56px] text-[#c1c8c2] block mb-3">local_shipping</span>
                    <p className="font-bold text-[#414844]">{tUI('No open jobs right now.', 'अभी कोई काम नहीं।')}</p>
                    <p className="text-sm text-[#717973] mt-1">{tUI('Farmers post when they need transport.', 'किसान ज़रूरत होने पर पोस्ट करते हैं।')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOpenJobs.map(job => {
                      const distKm = seedDistance(job.id);
                      const weightTons = job.unit === 'ton' ? job.quantity : job.unit === 'quintal' ? job.quantity / 10 : job.quantity / 1000;
                      const fare = calcFare(job.estimatedFareInr || 800, distKm, weightTons);
                      const isExpanded = expandedJob === job.id;
                      return (
                        <div key={job.id} className="bg-[#f3f4f3] border border-[#c1c8c2] rounded-2xl p-4 flex flex-col gap-4 shadow-sm active:scale-[0.98] transition-all">

                          {/* Card header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-[#c1c8c2] shadow-sm shrink-0">
                                <span className="material-symbols-outlined text-[32px] text-[#0e6c4a]" style={{ fontVariationSettings: "'FILL' 0" }}>{cropIcon(job.crop)}</span>
                              </div>
                              <div>
                                <h3 className="text-[18px] font-bold text-[#012d1d] leading-tight">{job.crop}</h3>
                                <p className="text-sm text-[#414844] mt-0.5">{job.quantity} {job.unit} · {distKm} km {tUI('away', 'दूर')}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="text-[22px] font-extrabold text-[#0e6c4a]">₹{fare.total.toLocaleString()}</span>
                              <p className="text-[10px] text-[#717973] uppercase tracking-widest font-bold mt-0.5">{tUI('EST. PAYOUT', 'अनुमान')}</p>
                            </div>
                          </div>

                          {/* Route */}
                          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[#e1e3e2]">
                            <div className="flex flex-col items-center shrink-0 gap-1">
                              <span className="material-symbols-outlined text-[#012d1d] text-[16px]">radio_button_checked</span>
                              <div className="w-0.5 h-4 border-l-2 border-dashed border-[#c1c8c2]" />
                              <span className="material-symbols-outlined text-[#0e6c4a] text-[16px]">location_on</span>
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <p className="text-sm font-bold text-[#191c1c] truncate">{job.pickupLocation}</p>
                              <p className="text-xs font-bold text-[#191c1c] truncate">{job.dropLocation}</p>
                            </div>
                            <button
                              onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                              className="w-9 h-9 rounded-full border border-[#c1c8c2] flex items-center justify-center hover:bg-[#edeeed] transition-colors shrink-0"
                              aria-label="Fare breakdown"
                            >
                              <span className="material-symbols-outlined text-[#414844] text-[18px]">{isExpanded ? 'expand_less' : 'info'}</span>
                            </button>
                          </div>

                          {/* Fare breakdown */}
                          {isExpanded && (
                            <div className="bg-[#a0f4c8]/20 border border-[#a0f4c8] rounded-xl p-4 space-y-2">
                              <p className="text-xs font-extrabold text-[#005236] uppercase tracking-wide">
                                {tUI('Area-based Fare Breakdown', 'क्षेत्र आधारित किराया')}
                              </p>
                              {[
                                { label: tUI('Base fare', 'बेस किराया'), val: fare.base },
                                { label: `${tUI('Distance', 'दूरी')} ${distKm}km × ₹22`, val: fare.distCharge },
                                { label: `${tUI('Load', 'लोड')} ${weightTons.toFixed(1)}T × ₹180`, val: fare.loadCharge },
                              ].map(r => (
                                <div key={r.label} className="flex justify-between text-sm text-[#005236]">
                                  <span>{r.label}</span>
                                  <span className="font-bold">₹{r.val.toLocaleString()}</span>
                                </div>
                              ))}
                              <div className="flex justify-between font-extrabold text-[#012d1d] border-t border-[#a0f4c8] pt-2 mt-1">
                                <span>{tUI('Total', 'कुल')}</span>
                                <span>₹{fare.total.toLocaleString()}</span>
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptJob(job)}
                              disabled={!isOnline}
                              className="flex-1 flex items-center justify-center gap-2 bg-[#0e6c4a] hover:bg-[#005236] disabled:bg-[#e1e3e2] disabled:text-[#717973] text-white font-bold py-4 rounded-xl text-base transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              {tUI('Accept Job', 'काम स्वीकार करें')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ══════════ ACTIVE TRIP ══════════ */}
        {activeTab === 'active' && (
          !activeJob ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
              <div className="w-24 h-24 rounded-full bg-[#edeeed] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[48px] text-[#c1c8c2]">local_shipping</span>
              </div>
              <h2 className="text-[22px] font-extrabold text-[#191c1c] mb-2">{tUI('No Active Trip', 'कोई सक्रिय ट्रिप नहीं')}</h2>
              <p className="text-[#414844] mb-8">{tUI('Accept a job from the Jobs tab to start your trip.', 'ट्रिप शुरू करने के लिए काम टैब से जॉब स्वीकार करें।')}</p>
              <button
                onClick={() => setActiveTab('jobs')}
                className="bg-[#0e6c4a] text-white font-bold py-4 px-8 rounded-2xl hover:bg-[#005236] transition-colors shadow-md"
              >
                {tUI('Find Jobs', 'काम खोजें')}
              </button>
            </div>
          ) : (
            <div>
              {/* Map area */}
              <section className="relative w-full h-[340px] overflow-hidden bg-[#edeeed]">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #3d6b50 0%, #5a8a6a 40%, #6b9e78 70%, #4a7c59 100%)',
                    backgroundImage: `
                      radial-gradient(ellipse at 20% 30%, rgba(1,45,29,0.5) 0%, transparent 45%),
                      radial-gradient(ellipse at 75% 65%, rgba(14,108,74,0.3) 0%, transparent 40%)
                    `,
                  }}
                />
                {/* Route SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 340" preserveAspectRatio="none">
                  <path d="M 80,300 Q 160,200 260,120 Q 320,80 380,60" stroke="rgba(255,255,255,0.5)" strokeWidth="5" fill="none" strokeDasharray="12,7" />
                  <circle cx="80" cy="300" r="10" fill="#012d1d" stroke="white" strokeWidth="3" />
                  <circle cx="380" cy="60" r="10" fill="#0e6c4a" stroke="white" strokeWidth="3" />
                  {jobStep >= 1 && <circle cx="220" cy="175" r="14" fill="white" stroke="#012d1d" strokeWidth="3" />}
                  {jobStep >= 1 && (
                    <text x="220" y="180" textAnchor="middle" fontSize="12" fill="#012d1d" fontWeight="bold">🚛</text>
                  )}
                </svg>
                {/* Gradient to white */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 55%, #f9f9f8 100%)' }} />

                {/* ETA card */}
                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#012d1d] text-white p-3 rounded-xl">
                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>navigation</span>
                      </div>
                      <div>
                        <p className="text-xs text-[#414844] font-semibold">{tUI('Estimated Arrival', 'अनुमानित समय')}</p>
                        <h2 className="text-[18px] font-extrabold text-[#012d1d]">
                          {jobStep === 0 ? tUI('At pickup', 'पिकअप पर') :
                           jobStep === 1 ? tUI('Loading cargo', 'लोड हो रहा') :
                           jobStep === 2 ? `${seedDistance(activeJob.id)} km · ~${Math.round(seedDistance(activeJob.id) * 2.5)} min` :
                           tUI('Arrived! ✓', 'पहुँच गए! ✓')}
                        </h2>
                      </div>
                    </div>
                    {liveShareOn && (
                      <div className="bg-[#a0f4c8] text-[#005236] text-xs font-extrabold px-3 py-1 rounded-lg">
                        {tUI('LIVE ON', 'लाइव चालू')}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Trip details */}
              <section className="relative z-20 px-5 -mt-6 space-y-4 pb-28">

                {/* Pickup → Drop card */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e1e3e2] flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                      <span className="material-symbols-outlined text-[#012d1d] text-[20px]">radio_button_checked</span>
                      <div className="w-0.5 h-10 border-l-2 border-dashed border-[#c1c8c2]" />
                      <span className="material-symbols-outlined text-[#0e6c4a] text-[20px]">location_on</span>
                    </div>
                    <div className="flex-1 space-y-5">
                      <div>
                        <p className="text-xs text-[#717973] font-semibold uppercase tracking-wide">{tUI('Pickup From', 'पिकअप से')}</p>
                        <h3 className="text-[17px] font-bold text-[#191c1c] mt-0.5">{activeJob.farmerName}</h3>
                        <p className="text-sm text-[#717973]">{activeJob.pickupLocation}</p>
                      </div>
                      <div className="border-t border-[#edeeed] pt-4">
                        <p className="text-xs text-[#717973] font-semibold uppercase tracking-wide">{tUI('Deliver To', 'मंज़िल')}</p>
                        <h3 className="text-[17px] font-bold text-[#191c1c] mt-0.5">{activeJob.dropLocation}</h3>
                        <p className="text-sm text-[#717973]">{tUI('Buyer / Market', 'खरीदार / मंडी')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bento contact grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Farmer */}
                    <div className="bg-[#f3f4f3] p-4 rounded-2xl border border-[#e1e3e2] flex flex-col gap-4 min-h-[120px] justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#c1ecd4] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#002114] text-[18px]">agriculture</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#717973] uppercase tracking-wide">{tUI('Farmer', 'किसान')}</p>
                          <p className="text-sm font-bold text-[#191c1c] leading-tight truncate max-w-[80px]">{activeJob.farmerName}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href="tel:+919876543210" className="flex-1 bg-white h-11 rounded-xl border border-[#c1c8c2] flex items-center justify-center hover:bg-[#edeeed] transition-colors active:scale-95">
                          <span className="material-symbols-outlined text-[#0e6c4a] text-[18px]">call</span>
                        </a>
                        <button className="flex-1 bg-white h-11 rounded-xl border border-[#c1c8c2] flex items-center justify-center hover:bg-[#edeeed] transition-colors active:scale-95">
                          <span className="material-symbols-outlined text-[#0e6c4a] text-[18px]">chat_bubble</span>
                        </button>
                      </div>
                    </div>
                    {/* Buyer */}
                    <div className="bg-[#f3f4f3] p-4 rounded-2xl border border-[#e1e3e2] flex flex-col gap-4 min-h-[120px] justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#a0f4c8] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#002113] text-[18px]">storefront</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#717973] uppercase tracking-wide">{tUI('Buyer', 'खरीदार')}</p>
                          <p className="text-sm font-bold text-[#191c1c] leading-tight">{tUI('Market', 'मंडी')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href="tel:+919876543211" className="flex-1 bg-white h-11 rounded-xl border border-[#c1c8c2] flex items-center justify-center hover:bg-[#edeeed] transition-colors active:scale-95">
                          <span className="material-symbols-outlined text-[#0e6c4a] text-[18px]">call</span>
                        </a>
                        <button className="flex-1 bg-white h-11 rounded-xl border border-[#c1c8c2] flex items-center justify-center hover:bg-[#edeeed] transition-colors active:scale-95">
                          <span className="material-symbols-outlined text-[#0e6c4a] text-[18px]">chat_bubble</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payload / Payout card */}
                <div className="bg-[#012d1d] text-white p-5 rounded-2xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[40px] text-[#a0f4c8]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                    <div>
                      <p className="text-xs text-[#86af99] uppercase tracking-widest font-bold">{tUI('Payload', 'माल')}</p>
                      <h4 className="text-[18px] font-extrabold mt-0.5">{activeJob.quantity} {activeJob.unit} {activeJob.crop}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#86af99] font-semibold">{tUI('Payment', 'भुगतान')}</p>
                    <h4 className="text-[22px] font-extrabold">₹{(activeJob.estimatedFareInr || 0).toLocaleString()}</h4>
                  </div>
                </div>

                {/* Live sharing toggle */}
                <div className="bg-white border border-[#e1e3e2] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-bold text-[#191c1c]">{tUI('Live Location Sharing', 'लाइव लोकेशन शेयरिंग')}</p>
                    <p className="text-xs text-[#717973] mt-0.5">
                      {liveShareOn
                        ? `${tUI('Code', 'कोड')}: ${trackingCode(activeJob.id)} · ${tUI('Visible to farmer & buyer', 'किसान और खरीदार को दिखेगा')}`
                        : tUI('Farmer & buyer can track you', 'किसान और खरीदार ट्रैक कर सकते हैं')}
                    </p>
                  </div>
                  <button
                    onClick={() => setLiveShareOn(v => !v)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${liveShareOn ? 'bg-[#0e6c4a]' : 'bg-[#c1c8c2]'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${liveShareOn ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Journey stepper */}
                <div className="bg-white border border-[#e1e3e2] rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-extrabold text-[#717973] uppercase tracking-wider mb-4">{tUI('Journey Progress', 'यात्रा प्रगति')}</p>
                  <div className="space-y-3">
                    {STEP_LABELS.map((label, i) => {
                      const done = i < jobStep;
                      const current = i === jobStep;
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            done ? 'bg-[#0e6c4a] border-[#0e6c4a]' : current ? 'bg-white border-[#0e6c4a]' : 'bg-white border-[#c1c8c2]'
                          }`}>
                            {done
                              ? <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                              : <span className={`text-sm font-extrabold ${current ? 'text-[#0e6c4a]' : 'text-[#c1c8c2]'}`}>{i + 1}</span>
                            }
                          </div>
                          <p className={`text-base font-semibold ${done ? 'text-[#0e6c4a] line-through' : current ? 'text-[#012d1d] font-extrabold' : 'text-[#c1c8c2]'}`}>
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Sticky bottom CTA */}
              {jobStep < 3 && (
                <div className="fixed bottom-20 left-0 w-full px-5 z-40">
                  <button
                    onClick={handleAdvanceStep}
                    disabled={stepLoading}
                    className="w-full h-16 bg-[#0e6c4a] hover:bg-[#005236] text-white font-extrabold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-60"
                  >
                    {stepLoading
                      ? <span className="material-symbols-outlined animate-spin">refresh</span>
                      : <>
                          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span>{getAdvanceCTA()}</span>
                        </>
                    }
                  </button>
                </div>
              )}
              {jobStep === 3 && (
                <div className="fixed bottom-20 left-0 w-full px-5 z-40">
                  <div className="w-full h-16 bg-[#c1ecd4] text-[#002114] font-extrabold text-lg rounded-2xl flex items-center justify-center gap-3 border-2 border-[#0e6c4a]">
                    <span className="material-symbols-outlined text-[#0e6c4a] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    {tUI('Delivered! Payout Initiated ✓', 'डिलीवर! भुगतान शुरू ✓')}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* ══════════ EARNINGS ══════════ */}
        {activeTab === 'earnings' && (
          <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
            {/* Summary card */}
            <div className="bg-[#012d1d] text-white rounded-3xl p-7 shadow-lg">
              <p className="text-[#86af99] text-sm font-semibold">{tUI('Total Earnings', 'कुल कमाई')}</p>
              <p className="text-5xl font-black mt-1 mb-6">₹{totalEarnings.toLocaleString()}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: completedJobs.length, label: tUI('Trips Done', 'ट्रिप पूरी') },
                  { val: completedJobs.length > 0 ? `₹${Math.round(totalEarnings / completedJobs.length).toLocaleString()}` : '₹0', label: tUI('Avg/Trip', 'औसत/ट्रिप') },
                  { val: `${completedJobs.reduce((s, j) => s + seedDistance(j.id), 0)} km`, label: tUI('Km Driven', 'किमी') },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                    <p className="text-xl font-black">{stat.val}</p>
                    <p className="text-[11px] text-[#86af99] font-bold uppercase mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trip list */}
            {completedJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#e1e3e2]">
                <span className="material-symbols-outlined text-[56px] text-[#e1e3e2] block mb-3">local_shipping</span>
                <p className="font-bold text-[#717973]">{tUI('No completed trips yet.', 'अभी कोई पूरी ट्रिप नहीं।')}</p>
                <button onClick={() => setActiveTab('jobs')} className="mt-4 bg-[#0e6c4a] text-white font-bold py-3 px-7 rounded-xl hover:bg-[#005236]">
                  {tUI('Find Jobs', 'काम खोजें')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {completedJobs.map(job => (
                  <div key={job.id} className="bg-white rounded-2xl p-5 border border-[#e1e3e2] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f3f4f3] rounded-xl flex items-center justify-center border border-[#e1e3e2] shrink-0">
                        <span className="material-symbols-outlined text-[#0e6c4a] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                      </div>
                      <div>
                        <p className="font-bold text-[#191c1c] text-sm">{job.pickupLocation} → {job.dropLocation}</p>
                        <p className="text-xs text-[#717973]">{job.crop} · {job.quantity} {job.unit}</p>
                        <p className="text-[11px] text-[#c1c8c2] mt-0.5">#{job.id.slice(-8).toUpperCase()} · {seedDistance(job.id)} km · {new Date(job.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xl font-black text-[#012d1d]">₹{(job.estimatedFareInr || 0).toLocaleString()}</p>
                      <span className="text-[11px] font-bold text-[#0e6c4a] bg-[#a0f4c8]/30 px-2 py-0.5 rounded-full">{tUI('Delivered ✓', 'डिलीवर ✓')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 bg-white border-t border-zinc-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] rounded-t-2xl">
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${active ? 'bg-[#edeeed] text-[#012d1d]' : 'text-[#717973] hover:text-[#414844]'}`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className={`text-[11px] font-bold ${active ? 'text-[#012d1d]' : 'text-[#717973]'}`}>{item.label}</span>
              {item.id === 'active' && activeJob && jobStep < 3 && (
                <span className="absolute top-1.5 right-3.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse border border-white" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
