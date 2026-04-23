const KEY = 'saarthi.v2.buyerChat';

export type BuyerChatMsg = { id: string; role: 'buyer' | 'farmer'; text: string; at: string };

function loadAll(): Record<string, BuyerChatMsg[]> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, BuyerChatMsg[]>;
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, BuyerChatMsg[]>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function listBuyerChat(produceId: string): Promise<BuyerChatMsg[]> {
  const all = loadAll();
  return [...(all[produceId] ?? [])].sort((a, b) => a.at.localeCompare(b.at));
}

export async function appendBuyerChat(produceId: string, role: 'buyer' | 'farmer', text: string): Promise<BuyerChatMsg> {
  const all = loadAll();
  const row: BuyerChatMsg = {
    id: `m-${Date.now()}`,
    role,
    text,
    at: new Date().toISOString(),
  };
  const list = all[produceId] ?? [];
  list.push(row);
  all[produceId] = list.slice(-80);
  saveAll(all);
  return row;
}
