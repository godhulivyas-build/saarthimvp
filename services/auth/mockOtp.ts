/** Mock OTP — replace with SMS gateway + server verify */
export const MOCK_OTP = '123456';

export async function requestOtp(phone: string): Promise<{ ok: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    return { ok: false, message: 'invalid_phone' };
  }
  return { ok: true, message: 'sent' };
}

export async function verifyOtp(phone: string, otp: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 400));
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return { ok: false };
  return { ok: otp.trim() === MOCK_OTP };
}
