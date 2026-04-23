import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { V2Button } from '../ui/V2Button';
import { useI18n } from '../../../i18n/I18nContext';
import { confirmRazorpayMockPayment, createRazorpayMockOrder } from '../../../services/payments/razorpayMock';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  amountInr: number;
  cropLabel: string;
  onClose: () => void;
  onPaid: () => Promise<void>;
};

export const PaymentCheckoutSheet: React.FC<Props> = ({ open, amountInr, cropLabel, onClose, onPaid }) => {
  const { tV2 } = useI18n();
  const [phase, setPhase] = useState<'idle' | 'creating' | 'paying'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('idle');
      setOrderId(null);
    }
  }, [open]);

  if (!open) return null;

  const startPay = async () => {
    setPhase('creating');
    const ord = await createRazorpayMockOrder(amountInr, cropLabel);
    setOrderId(ord.id);
    setPhase('paying');
    await confirmRazorpayMockPayment(ord.id);
    setPhase('done');
    await onPaid();
    setPhase('idle');
    setOrderId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/45 p-0 sm:p-4">
      <Card className="w-full max-w-md rounded-b-none sm:rounded-3xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">{tV2('v2.payment.title')}</p>
            <p className="text-lg font-extrabold saarthi-headline text-[var(--saarthi-primary)] mt-1">{cropLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--saarthi-surface-low)]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-3xl font-black text-[var(--saarthi-on-background)]">
          ₹{amountInr.toLocaleString('en-IN')}
        </p>
        <div className="rounded-2xl bg-[var(--saarthi-surface-low)] p-4 space-y-2 text-sm">
          <p className="font-bold text-[var(--saarthi-on-surface-variant)]">{tV2('v2.payment.upiId')}</p>
          <p className="font-mono text-base break-all">farmer.pay@saarthi-demo</p>
          <div className="mt-3 flex justify-center">
            <div className="w-28 h-28 rounded-xl bg-white border border-dashed border-[var(--saarthi-outline-soft)] flex items-center justify-center text-[10px] text-center text-gray-500 px-1">
              {tV2('v2.payment.qrPlaceholder')}
            </div>
          </div>
        </div>
        {orderId ? <p className="text-xs text-gray-500 font-mono">{orderId}</p> : null}
        <V2Button fullWidth variant="primary" disabled={phase !== 'idle'} onClick={startPay}>
          {phase === 'idle' ? (
            <span className="flex flex-col items-center leading-tight">
              <span>{tV2('v2.payment.payRazorpay')}</span>
              <span className="text-[11px] font-semibold opacity-90">{tV2('v2.payment.payRazorpayHi')}</span>
            </span>
          ) : (
            <span>{tV2('v2.payment.processing')}</span>
          )}
        </V2Button>
        <p className="text-[11px] text-center text-[var(--saarthi-on-surface-variant)] leading-snug">{tV2('v2.payment.mockNote')}</p>
      </Card>
    </div>
  );
};
