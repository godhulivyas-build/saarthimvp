/**
 * Razorpay-shaped mock: same async steps as a real client (create → pay → done).
 * When `VITE_RAZORPAY_KEY_ID` is set later, load SDK here; until then this stays mock-only.
 */
export type RazorpayMockOrder = { id: string; amountPaise: number; currency: 'INR'; receipt: string };

export async function createRazorpayMockOrder(amountInr: number, receipt: string): Promise<RazorpayMockOrder> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: `rzp_order_${Date.now()}`,
    amountPaise: Math.round(amountInr * 100),
    currency: 'INR',
    receipt,
  };
}

export async function confirmRazorpayMockPayment(_orderId: string): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true };
}
