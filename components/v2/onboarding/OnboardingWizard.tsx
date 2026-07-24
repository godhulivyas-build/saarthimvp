import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../../state/AppState';
import { useV2Session } from '../../../state/v2Session';
import type { SarthiUserRole } from '../../../types';
import { useI18n } from '../../../i18n/I18nContext';
import { sendOtp, verifyOtp, type OtpMode } from '../../../services/authService';
import { AppHeader } from '../../shared/AppHeader';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole, setLang } = useAppState();
  const { completeOnboarding, updateSession } = useV2Session();
  const { lang: globalLang } = useI18n();

  // 1 = Welcome/Role, 2 = Phone/OTP, 3 = Farm Details
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<string>(globalLang || 'en');
  const [role, setRole] = useState<SarthiUserRole>('farmer');

  const isHi = language !== 'en';
  const tUI = (en: string, hi: string) => isHi ? hi : en;
  const pageT = (en: string, hi: string, kn: string, te: string) => {
    if (language === 'kn') return kn;
    if (language === 'te') return te;
    if (language !== 'en') return hi;
    return en;
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMode, setOtpMode] = useState<OtpMode | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleRoleContinue = (selectedRole: SarthiUserRole) => {
    setRole(selectedRole);
    setUserRole(selectedRole);
    setStep(2);
  };

  const handleSendOtp = async () => {
    if (!name || phone.length !== 10) {
      alert(tUI('Please enter your name and a valid 10-digit mobile number.', 'कृपया अपना नाम और एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें।'));
      return;
    }
    setAuthError('');
    setSendingOtp(true);
    const result = await sendOtp(phone);
    setSendingOtp(false);
    if (!result.ok) {
      setAuthError(result.error ?? tUI('Could not send OTP. Please try again.', 'OTP नहीं भेजा जा सका। दोबारा कोशिश करें।'));
      return;
    }
    setOtpMode(result.mode);
    setOtpSent(true);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setVerifying(true);
    const result = await verifyOtp(phone, otp, otpMode ?? 'dev-fallback');
    setVerifying(false);
    if (!result.ok) {
      setAuthError(result.error ?? tUI('Incorrect code. Please try again.', 'गलत कोड। दोबारा कोशिश करें।'));
      return;
    }
    completeOnboarding({ persona: role, name, phone, authMode: result.mode });
    updateSession({ name, phone });
    navigate('/app');
  };

  const handleFinish = () => {
    navigate('/app');
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center font-['Lexend']" style={{ backgroundColor: '#fdf7ff', color: '#1d1b20' }}>
        <div className="w-full"><AppHeader /></div>
        <main className="w-full max-w-5xl mt-8 pb-24 px-6">
          <div className="text-center mb-8">
            <h1 className="text-[40px] leading-[48px] font-bold tracking-tight mb-2">{pageT('Welcome to Sarthi', 'Sarthi में आपका स्वागत है', 'Sarthi ಗೆ ಸ್ವಾಗತ', 'Sarthi కి స్వాగతం')}</h1>
            <p className="text-[18px] leading-[28px] max-w-2xl mx-auto" style={{ color: '#494551' }}>{pageT('Please choose your preferred language to begin.', 'शुरू करने के लिए अपनी पसंदीदा भाषा चुनें।', 'ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ.', 'ప్రారంభించడానికి మీ భాషను ఎంచుకోండి.')}</p>
          </div>
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => { setLanguage('en'); setLang('en'); updateSession({ preferredLang: 'en' }); }} className="group relative overflow-hidden bg-white border p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center" style={{ borderColor: language === 'en' ? '#4f378a' : '#cbc4d2' }}>
                <div className="w-20 h-20 mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e9ddff', color: '#22005d' }}>
                  <span className="text-3xl font-bold">Aa</span>
                </div>
                <h2 className="text-[20px] leading-[24px] font-semibold">English</h2>
                <p className="text-[12px] leading-[16px] font-medium mt-2" style={{ color: '#7a7582' }}>Standard English layout</p>
                <div className={`absolute bottom-0 left-0 w-full h-1 transform transition-transform ${language === 'en' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ backgroundColor: '#4f378a' }}></div>
              </button>
              <button onClick={() => { setLanguage('hi'); setLang('hi'); updateSession({ preferredLang: 'hi' }); }} className="group relative overflow-hidden bg-white border p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center" style={{ borderColor: language === 'hi' ? '#765b00' : '#cbc4d2' }}>
                <div className="w-20 h-20 mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffdf93', color: '#241a00' }}>
                  <span className="text-4xl font-bold">अ</span>
                </div>
                <h2 className="text-[20px] leading-[24px] font-semibold">Hindi</h2>
                <p className="text-[12px] leading-[16px] font-medium mt-2" style={{ color: '#7a7582' }}>हिंदी भाषा अनुभव</p>
                <div className={`absolute bottom-0 left-0 w-full h-1 transform transition-transform ${language === 'hi' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ backgroundColor: '#765b00' }}></div>
              </button>
              <button onClick={() => { setLanguage('mr'); setLang('hi'); updateSession({ preferredLang: 'hi' }); }} className="group relative overflow-hidden bg-white border p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center" style={{ borderColor: language === 'mr' ? '#63597c' : '#cbc4d2' }}>
                <div className="w-20 h-20 mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e1d4fd', color: '#1f1635' }}>
                  <span className="text-4xl font-bold">म</span>
                </div>
                <h2 className="text-[20px] leading-[24px] font-semibold">Marathi</h2>
                <p className="text-[12px] leading-[16px] font-medium mt-2" style={{ color: '#7a7582' }}>मराठी भाषेतील सेवा</p>
                <div className={`absolute bottom-0 left-0 w-full h-1 transform transition-transform ${language === 'mr' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ backgroundColor: '#63597c' }} />
              </button>
              <button onClick={() => { setLanguage('kn'); setLang('kn'); updateSession({ preferredLang: 'kn' }); }} className="group relative overflow-hidden bg-white border p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center" style={{ borderColor: language === 'kn' ? '#6750a4' : '#cbc4d2' }}>
                <div className="w-20 h-20 mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#cfbcff', color: '#22005d' }}>
                  <span className="text-4xl font-bold">ಕ</span>
                </div>
                <h2 className="text-[20px] leading-[24px] font-semibold">Kannada</h2>
                <p className="text-[12px] leading-[16px] font-medium mt-2" style={{ color: '#7a7582' }}>ಕನ್ನಡ ಭಾಷೆಯ ಅನುಭವ</p>
                <div className={`absolute bottom-0 left-0 w-full h-1 transform transition-transform ${language === 'kn' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ backgroundColor: '#6750a4' }}></div>
              </button>
              <button onClick={() => { setLanguage('te'); setLang('te'); updateSession({ preferredLang: 'te' }); }} className="group relative overflow-hidden bg-white border p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center" style={{ borderColor: language === 'te' ? '#c9a74d' : '#cbc4d2' }}>
                <div className="w-20 h-20 mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e7c365', color: '#241a00' }}>
                  <span className="text-4xl font-bold">తె</span>
                </div>
                <h2 className="text-[20px] leading-[24px] font-semibold">Telugu</h2>
                <p className="text-[12px] leading-[16px] font-medium mt-2" style={{ color: '#7a7582' }}>తెలుగు భాషా అనుభవం</p>
                <div className={`absolute bottom-0 left-0 w-full h-1 transform transition-transform ${language === 'te' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ backgroundColor: '#c9a74d' }}></div>
              </button>
            </div>
          </section>
          <section className="mt-8 border-t pt-8" style={{ borderColor: '#cbc4d2' }}>
            <div className="text-center mb-4">
              <h3 className="text-[24px] leading-[32px] font-semibold">{pageT('Who are you?', 'आप कौन हैं?', 'ನೀವು ಯಾರು?', 'మీరు ఎవరు?')}</h3>
              <p className="text-[16px] leading-[24px]" style={{ color: '#494551' }}>{pageT('Select your role to customize your experience.', 'अपनी भूमिका चुनें।', 'ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ.', 'మీ పాత్రను ఎంచుకోండి.')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div onClick={() => handleRoleContinue('farmer')} className="group cursor-pointer bg-white rounded-xl shadow-sm border border-transparent hover:border-[#4f378a] p-6 transition-all text-left">
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
                  <img alt="Farmer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDK0ygfI9uNUyOClp4lzztF_j6psJtSj3ce7C7y0lBy3ZEQcl4E2IPsHjhNBCY31IapPhJwfT_KLn09O8B2VvAHETVDOjDi96Nr7rCKJ8aV46PWJXy78GuO7JmJRMKjGGc8L8vUQ1yFiymoCLUM9Cy6VaexJsd_9jnm3ff3xUlyatbvBm0lb4lhuYEpmU-x5CGxDC3f6EDnzxpCP-pvc0JXzxzTgjE32r8tCp64lf_AiLcM53f_BJrTetOUIxnlgOzmpSusCsfymA"/>
                  <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined" style={{ color: '#4f378a', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>agriculture</span>
                  <h4 className="text-[20px] leading-[24px] font-semibold">{pageT('Farmer', 'किसान', 'ರೈತ', 'రైతు')}</h4>
                </div>
                <p className="text-[12px] leading-[16px] font-medium" style={{ color: '#494551' }}>{pageT('List your crops, check soil health, and find buyers directly.', 'फसल लिस्ट करें, मिट्टी जांचें, सीधे खरीदार खोजें।', 'ಬೆಳೆ ಪಟ್ಟಿ ಮಾಡಿ, ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ.', 'పంటలు నమోదు చేయండి, నేరుగా కొనుగోలుదారులను కనుగొనండి.')}</p>
              </div>
              <div onClick={() => handleRoleContinue('buyer')} className="group cursor-pointer bg-white rounded-xl shadow-sm border border-transparent hover:border-[#63597c] p-6 transition-all text-left">
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
                  <img alt="Buyer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5hoc52uDdC-dg1hooqVYrjuuKzzYgpRA0I_G6QpXrOn1xnVKu9n6GkBQJdjrjCOI4ZQOj7zt639Lddo-T2mquz_-W8ttCbrv27HbXux-yNyYRLPuNh9LByG-Xje13k_1DcW7Bi2PKQt8YcpZGcn5XX7RxO41oV48spRbKnGGdD8bOCSnbG8vfrO23Cl7VcT68o7bVvTRW_WPoZd5Zr_CJM2mI4_xI9IX4P0IURYcHDa9TGyuQtA1zO-w-NSBvmxBX-PB6OG4u5Sk"/>
                  <div className="absolute inset-0 bg-[#63597c]/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined" style={{ color: '#63597c', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>storefront</span>
                  <h4 className="text-[20px] leading-[24px] font-semibold">{pageT('Buyer', 'खरीदार', 'ಖರೀದಿದಾರ', 'కొనుగోలుదారు')}</h4>
                </div>
                <p className="text-[12px] leading-[16px] font-medium" style={{ color: '#494551' }}>{pageT('Purchase high-quality farm produce and manage inventory easily.', 'उच्च गुणवत्ता वाली फसल खरीदें।', 'ಉತ್ತಮ ಕೃಷಿ ಉತ್ಪನ್ನ ಖರೀದಿಸಿ.', 'నాణ్యమైన వ్యవసాయ ఉత్పత్తులు కొనండి.')}</p>
              </div>
              <div onClick={() => handleRoleContinue('logistics_partner')} className="group cursor-pointer bg-white rounded-xl shadow-sm border border-transparent hover:border-[#765b00] p-6 transition-all text-left">
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
                  <img alt="Transporter" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgcohGL_lnrqophEtNFuVQx7fHifGWDdtjf-T0gIItpx2tunv6TjMxpouMg7G6QI__nhzI7czB-nfGDq_okcYAysORsaoWz4xUrXICMH3iVd8bBblQJdDNDPulPYT_wGb7LO8NaJ1__9zCMXezk--eJPWSiE6PA0u8X9MPfBNYNSJofAJ2EOmlGrjBC7ajM5B9cvKLRa3sZ6WI7akLK_GaZdxUZApfUlCn-8KggrhVFWUkETIi-yUcV9NMJGAmy4TlqGSM9LBS9YI"/>
                  <div className="absolute inset-0 bg-[#765b00]/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined" style={{ color: '#765b00', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>local_shipping</span>
                  <h4 className="text-[20px] leading-[24px] font-semibold">{pageT('Transporter', 'ट्रांसपोर्टर', 'ಟ್ರಾನ್ಸ್‌ಪೋರ್ಟರ್', 'రవాణాదారు')}</h4>
                </div>
                <p className="text-[12px] leading-[16px] font-medium" style={{ color: '#494551' }}>{pageT('Find delivery gigs, track routes, and manage your fleet.', 'डिलीवरी काम खोजें, रूट ट्रैक करें।', 'ಡೆಲಿವರಿ ಕೆಲಸ ಹುಡುಕಿ, ರೂಟ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.', 'డెలివరీ పనులు కనుగొనండి, రూట్‌లు ట్రాక్ చేయండి.')}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center font-['Lexend']" style={{ backgroundColor: '#fdf7ff', color: '#1d1b20' }}>
        <div className="w-full"><AppHeader /></div>
        <main className="w-full max-w-md mt-10 px-6">
          <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(1,45,29,0.08)] border border-[#cbc4d2]">
            <h2 className="text-2xl font-extrabold mb-6 text-center text-emerald-950">{tUI('Verify Your Details', 'अपना विवरण सत्यापित करें')}</h2>
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">{tUI('Full Name', 'पूरा नाम')}</label>
                <div className="relative">
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-[#cbc4d2] rounded-xl px-4 py-3 focus:border-[#1B4332] focus:ring-0 focus:outline-none transition-all" placeholder={tUI('Enter your name', 'अपना नाम दर्ज करें')} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 hover:text-emerald-700 hover:scale-110 active:scale-95 transition-all bg-gray-100 p-1.5 rounded-lg">mic</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">{tUI('Mobile Number', 'मोबाइल नंबर')}</label>
                <div className="flex gap-2 relative">
                  <div className="border-2 border-[#cbc4d2] rounded-xl px-4 py-3 bg-gray-50 flex items-center justify-center text-gray-500 font-bold">+91</div>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="flex-1 border-2 border-[#cbc4d2] rounded-xl pl-4 pr-12 py-3 focus:border-[#1B4332] focus:ring-0 focus:outline-none transition-all tracking-widest" placeholder="9876543210" pattern="[0-9]{10}" maxLength={10} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 hover:text-emerald-700 hover:scale-110 active:scale-95 transition-all bg-gray-100 p-1.5 rounded-lg">mic</button>
                </div>
              </div>
              
              {authError && (
                <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{authError}</p>
              )}

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full bg-[#1B4332] text-white font-bold rounded-xl py-4 hover:bg-emerald-900 active:scale-95 transition-all shadow-md mt-2 flex justify-center items-center gap-2 disabled:opacity-60"
                >
                  {sendingOtp ? tUI('Sending…', 'भेजा जा रहा है…') : tUI('Send OTP', 'OTP भेजें')}
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {otpMode === 'dev-fallback' && (
                    <p className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                      {tUI(
                        '🧪 Sandbox mode — no SMS backend configured yet. Any 4-digit code works.',
                        '🧪 सैंडबॉक्स मोड — अभी SMS बैकएंड कॉन्फ़िगर नहीं है। कोई भी 4-अंकों का कोड काम करेगा।'
                      )}
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">{tUI('Enter OTP', 'OTP दर्ज करें')}</label>
                    <input required type="text" value={otp} onChange={e => setOtp(e.target.value)} className="w-full border-2 border-[#cbc4d2] rounded-xl px-4 py-3 focus:border-[#1B4332] focus:ring-0 focus:outline-none transition-all text-center tracking-[1em] font-bold text-xl" placeholder="••••" maxLength={4} />
                    <p className="text-xs text-gray-500 text-center mt-3 font-medium">{tUI(`OTP sent to +91 ${phone}`, `+91 ${phone} पर OTP भेजा गया`)}</p>
                  </div>
                  <button type="submit" disabled={verifying} className="w-full bg-[#1B4332] text-white font-bold rounded-xl py-4 hover:bg-emerald-900 active:scale-95 transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-60">
                    {verifying ? tUI('Verifying…', 'सत्यापित हो रहा है…') : tUI('Verify & Continue', 'सत्यापित करें और आगे बढ़ें')}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Step 3: Farm Setup Onboarding
  return (
    <div className="bg-background text-on-background font-['Lexend'] overflow-x-hidden min-h-screen">
      <style>{`
        .step-connector { position: relative; }
        .step-connector::after {
            content: '';
            position: absolute;
            top: 16px;
            left: 32px;
            width: calc(100% - 32px);
            height: 4px;
            background-color: #c1c8c2;
            z-index: 0;
        }
        .step-connector.completed::after {
            background-color: #85d7ad;
        }
      `}</style>
      <AppHeader />
      <div className="flex">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-0 h-full overflow-y-auto w-64 border-r-2 border-emerald-100 dark:border-emerald-900 hidden md:flex flex-col bg-emerald-50 dark:bg-slate-950 z-40 pt-20">
          <div className="px-6 mb-8">
            <h2 className="text-xl font-bold text-emerald-900">Sarthi Dashboard</h2>
            <p className="text-sm text-emerald-800 dark:text-emerald-200">Modern Farming Guide</p>
          </div>
          <nav className="flex-1 space-y-1">
            <a className="flex items-center gap-3 px-4 py-3 mx-2 my-1 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg hover:translate-x-1 transition-transform font-medium" href="#">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>dashboard</span>
              <span>Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 mx-2 my-1 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg hover:translate-x-1 transition-transform font-medium" href="#">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>storefront</span>
              <span>Marketplace</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 mx-2 my-1 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg hover:translate-x-1 transition-transform font-medium" href="#">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>psychiatry</span>
              <span>Expert Advice</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 mx-2 my-1 bg-emerald-700 text-white rounded-lg hover:translate-x-1 transition-transform font-medium shadow-md" href="#">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>psychology_alt</span>
              <span>My Crops</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 mx-2 my-1 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg hover:translate-x-1 transition-transform font-medium" href="#">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>cloud</span>
              <span>Weather</span>
            </a>
          </nav>
          <div className="p-4 mt-auto space-y-2">
            <button className="w-full py-4 bg-primary-container text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>help</span>
              Get Help
            </button>
            <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800">
              <a className="flex items-center gap-3 px-4 py-2 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors font-medium" href="#">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>settings</span>
                <span>Settings</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-2 text-error hover:bg-error-container/20 rounded-lg transition-colors font-medium" href="#">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>logout</span>
                <span>Logout</span>
              </a>
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 md:ml-64 min-h-screen pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto px-container-margin py-stack-lg">
            {/* Stepper Progress */}
            <div className="flex items-center justify-between mb-12 relative">
              <div className="flex flex-col items-center gap-2 z-10 flex-1 step-connector completed">
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>check</span>
                </div>
                <span className="text-label-sm font-label-sm text-secondary">Personal Info</span>
              </div>
              <div className="flex flex-col items-center gap-2 z-10 flex-1 step-connector">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center ring-4 ring-secondary-container shadow-lg">
                  <span className="font-bold">2</span>
                </div>
                <span className="text-label-sm font-label-sm text-on-surface font-bold">Farm Details</span>
              </div>
              <div className="flex flex-col items-center gap-2 z-10 flex-1 step-connector">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                  <span className="font-bold">3</span>
                </div>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Crop Selection</span>
              </div>
              <div className="flex flex-col items-center gap-2 z-10 flex-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                  <span className="font-bold">4</span>
                </div>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Done</span>
              </div>
            </div>
            {/* Form Section */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_4px_20px_rgba(1,45,29,0.08)] border border-emerald-50">
              <div className="mb-8">
                <h1 className="text-headline-md font-headline-md text-primary mb-2">Tell us about your farm</h1>
                <p className="text-body-lg font-body-lg text-on-surface-variant">This helps us provide tailored weather alerts and market prices for your region.</p>
              </div>
              <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); handleFinish(); }}>
                {/* Farm Name */}
                <div className="space-y-3">
                  <label className="block font-label-xl text-label-xl text-on-surface">Farm Name</label>
                  <input className="w-full h-16 px-6 text-body-lg font-body-lg rounded-2xl border-2 border-outline-variant focus:border-secondary focus:ring-0 transition-all bg-surface-container-lowest" placeholder="e.g. Green Valley Estate" type="text" defaultValue="Saraswati Farm"/>
                </div>
                {/* Map Picker Mock */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="block font-label-xl text-label-xl text-on-surface">Farm Location</label>
                    <span className="text-secondary font-bold flex items-center gap-1 cursor-pointer">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>my_location</span>
                      Use current location
                    </span>
                  </div>
                  <div className="relative w-full h-64 rounded-3xl overflow-hidden border-2 border-outline-variant shadow-inner group">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRT5PVF9UwpELeQujEDwFxLk2zH8xEtt1pJwCDMYpnNbHLyAAyn3uRuHMQVFnoNYcMI_rR3SEvKANFdszLbiKlYTi5eiJUh_EtR1cJvOnlrcFe4mtvTzB5BVXgM0J6NFa5-_VOrAXz0-4_1oOHyJQKmnTXDtNuhXSTunxSBsvncLGkzUQfcvsxEZ7YRGoGaXhGGl4sYHzrRiz3X83m4bdsSS4DNtgiqSPpLASwzZhv1x9dXkV29FLrP6eeNDz8fHtuBI2B110n2C0"/>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-error text-5xl" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>location_on</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>map</span>
                      <span className="text-body-md font-medium">Satara District, Maharashtra, India</span>
                    </div>
                  </div>
                </div>
                {/* Land Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block font-label-xl text-label-xl text-on-surface">Land Size</label>
                    <div className="relative">
                      <input className="w-full h-16 px-6 pr-24 text-body-lg font-body-lg rounded-2xl border-2 border-outline-variant focus:border-secondary focus:ring-0 transition-all bg-surface-container-lowest" placeholder="0.00" type="number"/>
                      <div className="absolute right-3 top-3 bottom-3 flex items-center px-4 bg-emerald-100 rounded-xl text-secondary font-bold">
                        Acres
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block font-label-xl text-label-xl text-on-surface">Soil Type (Optional)</label>
                    <select className="w-full h-16 px-6 text-body-lg font-body-lg rounded-2xl border-2 border-outline-variant focus:border-secondary focus:ring-0 transition-all bg-surface-container-lowest appearance-none" defaultValue="Black Soil (Regur)">
                      <option>Select Soil Type</option>
                      <option value="Black Soil (Regur)">Black Soil (Regur)</option>
                      <option>Alluvial Soil</option>
                      <option>Red Soil</option>
                      <option>Laterite Soil</option>
                    </select>
                  </div>
                </div>
                {/* Irrigation Type - Visual Cards */}
                <div className="space-y-4">
                  <label className="block font-label-xl text-label-xl text-on-surface">Irrigation Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="cursor-pointer group">
                      <input className="hidden peer" id="drip" name="irrigation" type="radio" defaultChecked />
                      <label className="flex flex-col items-center justify-center p-4 h-40 bg-white border-2 border-outline-variant rounded-3xl peer-checked:border-secondary peer-checked:bg-secondary-container transition-all group-hover:border-secondary/50" htmlFor="drip">
                        <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant group-peer-checked:text-secondary" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>opacity</span>
                        <span className="font-bold text-center">Drip</span>
                      </label>
                    </div>
                    <div className="cursor-pointer group">
                      <input className="hidden peer" id="sprinkler" name="irrigation" type="radio"/>
                      <label className="flex flex-col items-center justify-center p-4 h-40 bg-white border-2 border-outline-variant rounded-3xl peer-checked:border-secondary peer-checked:bg-secondary-container transition-all group-hover:border-secondary/50" htmlFor="sprinkler">
                        <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant group-peer-checked:text-secondary" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>shower</span>
                        <span className="font-bold text-center">Sprinkler</span>
                      </label>
                    </div>
                    <div className="cursor-pointer group">
                      <input className="hidden peer" id="canal" name="irrigation" type="radio"/>
                      <label className="flex flex-col items-center justify-center p-4 h-40 bg-white border-2 border-outline-variant rounded-3xl peer-checked:border-secondary peer-checked:bg-secondary-container transition-all group-hover:border-secondary/50" htmlFor="canal">
                        <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant group-peer-checked:text-secondary" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>water</span>
                        <span className="font-bold text-center">Canal</span>
                      </label>
                    </div>
                    <div className="cursor-pointer group">
                      <input className="hidden peer" id="rainfed" name="irrigation" type="radio"/>
                      <label className="flex flex-col items-center justify-center p-4 h-40 bg-white border-2 border-outline-variant rounded-3xl peer-checked:border-secondary peer-checked:bg-secondary-container transition-all group-hover:border-secondary/50" htmlFor="rainfed">
                        <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant group-peer-checked:text-secondary" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>cloudy_snowing</span>
                        <span className="font-bold text-center">Rainfed</span>
                      </label>
                    </div>
                  </div>
                </div>
                {/* Form Navigation Buttons */}
                <div className="flex flex-col-reverse md:flex-row gap-4 pt-10 border-t border-emerald-100">
                  <button onClick={() => setStep(1)} className="flex-1 h-16 flex items-center justify-center gap-3 border-2 border-secondary text-secondary font-bold text-label-xl rounded-2xl hover:bg-emerald-50 active:scale-95 transition-all" type="button">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>arrow_back</span>
                    Back
                  </button>
                  <button onClick={handleFinish} className="flex-[2] h-16 flex items-center justify-center gap-3 bg-secondary text-white font-bold text-label-xl rounded-2xl shadow-lg shadow-secondary/20 hover:bg-primary active:scale-95 transition-all" type="button">
                    Save & Continue
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
