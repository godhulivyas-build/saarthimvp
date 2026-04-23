export function buildWhatsAppLink(message: string, phoneE164?: string): string {
  const base = phoneE164 ? `https://wa.me/${phoneE164}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function templateBookingConfirmation(input: {
  crop: string;
  qty: number;
  unit: string;
  from: string;
  to: string;
  fareInr: number;
  moisturePct?: number;
}): string {
  const m = typeof input.moisturePct === 'number' ? `\nMoisture: ${input.moisturePct}% (pilot)` : '';
  return [
    'Saarthi booking (pilot)',
    `Crop: ${input.crop}`,
    `Load: ${input.qty} ${input.unit}`,
    `Route: ${input.from} → ${input.to}`,
    `Est. fare: ₹${Math.round(input.fareInr)}`,
    m,
    '',
    'Please confirm & share driver assignment / next steps.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function templateStatusUpdateRequest(input: { bookingId: string; note?: string }): string {
  return [
    'Saarthi status update (pilot)',
    `Booking: ${input.bookingId}`,
    input.note ? `Note: ${input.note}` : '',
    '',
    'Please share current status on WhatsApp.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function templateTestimonialRequest(input: { role: 'farmer' | 'logistics_partner'; what: string }): string {
  return [
    'Saarthi feedback request (pilot)',
    `Role: ${input.role}`,
    `What worked / did not: ${input.what}`,
    '',
    'Can you share a short testimonial (text/voice note)? We will not post any personal details without consent.',
  ].join('\n');
}

