import { supabase, isSupabaseConfigured } from './supabaseClient';

export type ProduceInquiryInput = {
  crop: string;
  quantityQuintal: number;
  buyerName: string;
  buyerPhone: string;
  district?: string;
  notes?: string;
};

export type ProduceInquiryResult = { ok: boolean; error?: string };

/** In-memory fallback store, used only when Supabase isn't configured yet. Resets on page reload. */
let localInquiries: ProduceInquiryInput[] = [];

/**
 * Real lead capture — no payment processing exists yet, so this is honest about
 * what it does: saves a real request so a farmer/seller can be called to confirm
 * and arrange payment + delivery themselves. Never simulates a completed order.
 */
export async function submitProduceInquiry(input: ProduceInquiryInput): Promise<ProduceInquiryResult> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('produce_inquiries').insert({
      crop: input.crop,
      quantity_quintal: input.quantityQuintal,
      buyer_name: input.buyerName,
      buyer_phone: input.buyerPhone,
      district: input.district ?? null,
      notes: input.notes ?? null,
    });
    if (error) {
      console.error('Supabase submitProduceInquiry error:', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }
  localInquiries = [...localInquiries, input];
  return { ok: true };
}
