import type { PaymentRecord, PaymentSplit } from '../../types';

const store: PaymentRecord[] = [];

export function computeSplit(total: number): PaymentSplit {
  const platform = Math.round(total * 0.05);
  const logistics = Math.round(total * 0.12);
  const farmer = total - platform - logistics;
  return { farmer, logistics, platform, total };
}

export async function createMockPayment(orderId: string, total: number): Promise<PaymentRecord> {
  await new Promise((r) => setTimeout(r, 500));
  const rec: PaymentRecord = {
    id: `pay-${Date.now()}`,
    orderId,
    status: 'paid',
    split: computeSplit(total),
    createdAt: new Date().toISOString(),
  };
  store.unshift(rec);
  try {
    localStorage.setItem('saarthi.v2.payments', JSON.stringify(store.slice(0, 50)));
  } catch {
    // ignore
  }
  return rec;
}

export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem('saarthi.v2.payments');
    if (!raw) return [...store];
    return JSON.parse(raw) as PaymentRecord[];
  } catch {
    return [...store];
  }
}
