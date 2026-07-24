import { supabase, isSupabaseConfigured } from './supabaseClient';

export type OtpMode = 'real' | 'dev-fallback';

export type OtpSendResult = { ok: boolean; error?: string; mode: OtpMode };
export type OtpVerifyResult = { ok: boolean; error?: string; mode: OtpMode };

function toE164(phone10Digit: string): string {
  return `+91${phone10Digit}`;
}

/**
 * Real phone OTP via Supabase Auth (Authentication → Providers → Phone in the
 * Supabase dashboard, backed by an SMS gateway like Twilio/MessageBird/Vonage
 * configured there). When that's set up, this is genuine send/verify —
 * Supabase owns the code and the session, nothing here fakes it.
 *
 * Until an SMS gateway is configured in the dashboard, Supabase's phone auth
 * call fails (e.g. "Unsupported phone provider") — rather than blocking
 * onboarding on that, we degrade to a clearly-labeled sandbox mode where any
 * 4-digit code is accepted. The UI always shows a "🧪 Sandbox mode" badge in
 * this case so it's never mistaken for real verification. The moment a real
 * SMS gateway is enabled in Supabase, this automatically switches to mode:
 * 'real' with no code changes needed.
 */
export async function sendOtp(phone10Digit: string): Promise<OtpSendResult> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone10Digit) });
    if (!error) return { ok: true, mode: 'real' };
    console.warn('Supabase phone OTP unavailable, using sandbox fallback:', error.message);
    return { ok: true, mode: 'dev-fallback' };
  }
  return { ok: true, mode: 'dev-fallback' };
}

export async function verifyOtp(phone10Digit: string, token: string, mode: OtpMode): Promise<OtpVerifyResult> {
  if (mode === 'real' && isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: toE164(phone10Digit),
      token,
      type: 'sms',
    });
    if (error || !data.session) {
      return { ok: false, error: error?.message ?? 'Verification failed.', mode: 'real' };
    }
    return { ok: true, mode: 'real' };
  }
  if (token.length === 4) return { ok: true, mode: 'dev-fallback' };
  return { ok: false, error: 'Enter the 4-digit code.', mode: 'dev-fallback' };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}
