import type { ColdStorageRequest, ColdStorageSlot } from '../types';

const SLOTS_KEY = 'saarthi.v2.cold.slots';
const REQ_KEY = 'saarthi.v2.cold.requests';

const defaultSlots: ColdStorageSlot[] = [
  { id: 's1', label: 'Chamber A', capacityTons: 100, usedTons: 42, pricePerTonDay: 120 },
  { id: 's2', label: 'Chamber B', capacityTons: 80, usedTons: 10, pricePerTonDay: 135 },
];

function readSlots(): ColdStorageSlot[] {
  try {
    const r = localStorage.getItem(SLOTS_KEY);
    if (r) return JSON.parse(r) as ColdStorageSlot[];
  } catch {
    /* ignore */
  }
  return defaultSlots;
}

function writeSlots(s: ColdStorageSlot[]) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(s));
}

function readReqs(): ColdStorageRequest[] {
  try {
    const r = localStorage.getItem(REQ_KEY);
    if (r) return JSON.parse(r) as ColdStorageRequest[];
  } catch {
    /* ignore */
  }
  return [];
}

function writeReqs(r: ColdStorageRequest[]) {
  localStorage.setItem(REQ_KEY, JSON.stringify(r));
}

export async function listColdSlots(): Promise<ColdStorageSlot[]> {
  await new Promise((r) => setTimeout(r, 150));
  return readSlots();
}

export async function listColdRequests(): Promise<ColdStorageRequest[]> {
  await new Promise((r) => setTimeout(r, 150));
  return readReqs();
}

export async function seedColdRequest(req: Omit<ColdStorageRequest, 'id' | 'createdAt'>): Promise<ColdStorageRequest> {
  const full: ColdStorageRequest = {
    ...req,
    id: `cr-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const list = readReqs();
  list.unshift(full);
  writeReqs(list);
  return full;
}

export async function updateColdRequest(id: string, status: ColdStorageRequest['status']): Promise<void> {
  const list = readReqs().map((x) => (x.id === id ? { ...x, status } : x));
  writeReqs(list);
}
