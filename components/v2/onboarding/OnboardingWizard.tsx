import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { useV2Session } from '../../../state/v2Session';
import { useAppState } from '../../../state/AppState';
import type { Lang } from '../../../i18n/translations';
import type { SaarthiUserRole } from '../../../types';
import { requestOtp, verifyOtp } from '../../../services/auth/mockOtp';
import { MapPin, Mic } from 'lucide-react';
import { SinglePinLocationMap } from '../maps/SinglePinLocationMap';
import { MP_CENTER } from '../../../config/mpLocations';
import { Card, TextField, V2Button, StepIndicator } from '../ui';
import { useVoiceAssistant } from '../../../voice/VoiceAssistantProvider';

const LANGS: Lang[] = ['hi', 'en', 'kn', 'ta', 'te'];

const PersonaCard: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full min-h-[56px] rounded-2xl px-4 text-left font-bold transition-all border ${
      active
        ? 'border-[var(--saarthi-primary)] bg-white shadow-md text-[var(--saarthi-primary)]'
        : 'border-[var(--saarthi-outline-soft)] bg-[var(--saarthi-surface-low)] text-[var(--saarthi-on-background)]'
    }`}
  >
    {label}
  </button>
);

export const OnboardingWizard: React.FC = () => {
  const { tV2, lang } = useI18n();
  const { session, updateSession, clearSession } = useV2Session();
  const { setLang, setUserRole, setCurrentScreen } = useAppState();
  const navigate = useNavigate();
  const { say, dictateOnce, listening } = useVoiceAssistant();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(session.phone || '');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState(session.name || '');
  const [pickLang, setPickLang] = useState<Lang>(session.preferredLang || lang);
  const [persona, setPersona] = useState<SaarthiUserRole | null>(session.persona);
  const [address, setAddress] = useState(session.addressLabel || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (session.onboardingComplete && session.persona) {
      navigate('/app', { replace: true });
    }
  }, [session.onboardingComplete, session.persona, navigate]);

  useEffect(() => {
    const l = pickLang || lang;
    if (step === 3) say(l === 'hi' ? 'अपना नाम बोल सकते हैं।' : 'You can speak your name.');
    if (step === 6) say(l === 'hi' ? 'अपना गाँव या मंडी बोलें।' : 'Speak your village or mandi.');
  }, [step]);

  const goApp = () => {
    setLang(pickLang);
    if (persona) setUserRole(persona);
    setCurrentScreen('dashboard');
    navigate('/app', { replace: true });
  };

  const finish = () => {
    updateSession({
      phone: phone.replace(/\D/g, ''),
      name: name.trim(),
      preferredLang: pickLang,
      persona,
      addressLabel: address.trim(),
      onboardingComplete: true,
      otpVerified: true,
    });
    goApp();
  };

  const onRequestOtp = async () => {
    setErr('');
    setBusy(true);
    const p = phone.replace(/\D/g, '');
    if (p.length !== 10) {
      setErr('phone');
      setBusy(false);
      return;
    }
    const res = await requestOtp(p);
    if (!res.ok) setErr(res.message);
    updateSession({ phone: p });
    setBusy(false);
    if (res.ok) setStep(2);
  };

  const onVerifyOtp = async () => {
    setBusy(true);
    const ok = await verifyOtp(phone.replace(/\D/g, ''), otp);
    setBusy(false);
    if (!ok) {
      setErr('otp');
      return;
    }
    updateSession({ otpVerified: true });
    setStep(3);
  };

  const useGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateSession({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAddress((a) => a || `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
      },
      () => setErr('gps')
    );
  };

  return (
    <div className="px-4 py-6 pb-28 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button type="button" className="text-sm font-bold text-[var(--saarthi-primary)] px-2 py-1 rounded-xl hover:bg-white/60" onClick={() => navigate('/')}>
            {tV2('v2.common.back')}
          </button>
          <span className="text-xs font-bold text-[var(--saarthi-on-surface-variant)]">
            {tV2('v2.onboard.step')} {step}/7
          </span>
        </div>

        <StepIndicator total={7} current={step} className="mb-6" />

        <h1 className="saarthi-headline text-2xl sm:text-3xl font-extrabold text-[var(--saarthi-primary)] mb-1">{tV2('v2.header.app')}</h1>
        <p className="text-sm text-[var(--saarthi-on-surface-variant)] mb-4">{tV2('v2.onboard.welcomeLine')}</p>
        {err ? <p className="text-red-600 text-sm mb-3">{err}</p> : null}

        {step === 1 && (
          <Card className="space-y-4 mt-2">
            <h2 className="text-lg font-extrabold saarthi-headline text-[var(--saarthi-on-background)]">{tV2('v2.onboard.phoneTitle')}</h2>
            <p className="text-sm text-[var(--saarthi-on-surface-variant)]">{tV2('v2.onboard.phoneHint')}</p>
            <TextField
              id="phone"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
            />
            <V2Button type="button" fullWidth variant="primary" onClick={onRequestOtp} disabled={busy}>
              {tV2('v2.onboard.continue')}
            </V2Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-4 mt-2">
            <h2 className="text-lg font-extrabold saarthi-headline">{tV2('v2.onboard.otpTitle')}</h2>
            <p className="text-sm text-[var(--saarthi-on-surface-variant)]">{tV2('v2.onboard.otpHint')}</p>
            <TextField id="otp" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            <V2Button type="button" fullWidth variant="primary" onClick={onVerifyOtp} disabled={busy}>
              {tV2('v2.onboard.verify')}
            </V2Button>
            <button type="button" className="text-sm font-bold text-[var(--saarthi-tertiary)] w-full py-2" onClick={onRequestOtp}>
              {tV2('v2.onboard.resendOtp')}
            </button>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-4 mt-2">
            <h2 className="text-lg font-extrabold saarthi-headline">{tV2('v2.onboard.nameTitle')}</h2>
            <div className="flex gap-2 items-stretch">
              <TextField id="name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
              <button
                type="button"
                disabled={listening}
                onClick={() =>
                  dictateOnce({
                    lang: pickLang || lang,
                    onText: (txt) => setName(txt),
                  })
                }
                className="min-w-[56px] rounded-2xl border-2 border-[var(--saarthi-outline-soft)] bg-white text-[var(--saarthi-primary)] font-extrabold flex items-center justify-center disabled:opacity-60"
                aria-label="Dictate name"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <V2Button type="button" fullWidth variant="primary" onClick={() => name.trim() && setStep(4)} disabled={!name.trim()}>
              {tV2('v2.common.next')}
            </V2Button>
          </Card>
        )}

        {step === 4 && (
          <Card className="space-y-4 mt-2">
            <h2 className="text-lg font-extrabold saarthi-headline">{tV2('v2.onboard.langTitle')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setPickLang(l)}
                  className={`min-h-[52px] rounded-2xl font-bold border-2 transition-colors ${
                    pickLang === l ? 'bg-[var(--saarthi-primary)] text-white border-[var(--saarthi-primary)]' : 'bg-white border-[var(--saarthi-outline-soft)] text-[var(--saarthi-on-background)]'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <V2Button type="button" fullWidth variant="primary" onClick={() => setStep(5)}>
              {tV2('v2.common.next')}
            </V2Button>
          </Card>
        )}

        {step === 5 && (
          <Card className="space-y-3 mt-2">
            <h2 className="text-lg font-extrabold saarthi-headline">{tV2('v2.onboard.personaTitle')}</h2>
            <div className="space-y-2">
              <PersonaCard label={tV2('v2.persona.farmer')} active={persona === 'farmer'} onClick={() => setPersona('farmer')} />
              <PersonaCard label={tV2('v2.persona.buyer')} active={persona === 'buyer'} onClick={() => setPersona('buyer')} />
              <PersonaCard label={tV2('v2.persona.logistics')} active={persona === 'logistics_partner'} onClick={() => setPersona('logistics_partner')} />
              <PersonaCard label={tV2('v2.persona.cold')} active={persona === 'cold_storage_owner'} onClick={() => setPersona('cold_storage_owner')} />
            </div>
            <V2Button type="button" fullWidth variant="primary" disabled={!persona} onClick={() => setStep(6)}>
              {tV2('v2.common.next')}
            </V2Button>
          </Card>
        )}

        {step === 6 && (
          <Card className="space-y-4 mt-2">
            <h2 className="text-lg font-extrabold saarthi-headline">{tV2('v2.onboard.locationTitle')}</h2>
            <p className="text-sm text-[var(--saarthi-on-surface-variant)]">{tV2('v2.onboard.locationHint')}</p>
            <p className="text-xs text-[var(--saarthi-on-surface-variant)]">{tV2('v2.onboard.mapHint')}</p>
            <SinglePinLocationMap
              lat={session.lat}
              lng={session.lng}
              defaultCenter={MP_CENTER}
              onChange={(lat, lng) => {
                updateSession({ lat, lng });
              }}
            />
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                className="saarthi-input pl-11"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={tV2('v2.onboard.locationHint')}
              />
              <button
                type="button"
                disabled={listening}
                onClick={() =>
                  dictateOnce({
                    lang: pickLang || lang,
                    onText: (txt) => setAddress(txt),
                  })
                }
                className="absolute right-2 top-2 min-h-[40px] min-w-[40px] rounded-xl bg-[var(--saarthi-primary)] text-white flex items-center justify-center disabled:opacity-60"
                aria-label="Dictate location"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <V2Button type="button" fullWidth variant="outline" onClick={useGps}>
              {tV2('v2.onboard.useGps')}
            </V2Button>
            <V2Button type="button" fullWidth variant="primary" onClick={() => setStep(7)} disabled={!address.trim()}>
              {tV2('v2.common.next')}
            </V2Button>
          </Card>
        )}

        {step === 7 && (
          <Card className="space-y-4 mt-2">
            <h2 className="text-lg font-extrabold saarthi-headline">{tV2('v2.onboard.summaryTitle')}</h2>
            <div className="rounded-2xl bg-[var(--saarthi-surface-low)] p-4 space-y-2 text-sm border border-[var(--saarthi-outline-soft)]">
              <p>
                <span className="font-bold">{name}</span> · {phone}
              </p>
              <p>{address}</p>
              <p className="text-xs text-[var(--saarthi-on-surface-variant)]">{pickLang.toUpperCase()}</p>
            </div>
            <V2Button type="button" fullWidth variant="primary" onClick={finish}>
              {tV2('v2.onboard.continue')}
            </V2Button>
            <button type="button" className="text-xs text-gray-500 w-full text-center py-2" onClick={() => clearSession()}>
              Reset
            </button>
          </Card>
        )}
    </div>
  );
};
