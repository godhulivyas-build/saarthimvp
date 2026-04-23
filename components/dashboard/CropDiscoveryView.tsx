import React, { useEffect, useState } from 'react';
import { UserPreferences, ProduceItem, type PaymentRecord } from '../../types';
import { listProduce, placeOrder } from '../../services/mvpDataService';
import { createMockPayment } from '../../services/payments/mockPayment';
import { useI18n } from '../../i18n/I18nContext';
import { Search, MapPin, Loader2, IndianRupee, MessageCircle, Phone, Video } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../v2/ui/Card';
import { TextField } from '../v2/ui/TextField';
import { V2Button } from '../v2/ui/V2Button';
import { PaymentCheckoutSheet } from '../v2/payments/PaymentCheckoutSheet';
import { BuyerChatDrawer } from '../v2/buyer/BuyerChatDrawer';
import { CONTACT } from '../../config/contact';

interface CropDiscoveryViewProps {
  preferences: UserPreferences | null;
}

const CROP_OPTIONS = ['Soybean', 'Wheat', 'Onion', 'Gram', 'Garlic', 'Tomato'];

const QTY_PRESETS = [1, 5, 10, 25];

export const CropDiscoveryView: React.FC<CropDiscoveryViewProps> = ({ preferences }) => {
  const { t, tV2 } = useI18n();
  const [items, setItems] = useState<ProduceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [orderFor, setOrderFor] = useState<ProduceItem | null>(null);
  const [qty, setQty] = useState(1);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentRecord | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [chatFor, setChatFor] = useState<ProduceItem | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await listProduce();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((p) => {
    if (cropFilter && p.crop.toLowerCase() !== cropFilter.toLowerCase()) return false;
    if (locationFilter && p.farmerLocation !== locationFilter) return false;
    return true;
  });

  const orderTotal = orderFor ? Math.round(orderFor.pricePerUnit * qty * 100) / 100 : 0;

  const completeOrderAfterPay = async () => {
    if (!orderFor) return;
    const order = await placeOrder({
      produceId: orderFor.id,
      buyerName: preferences?.location?.trim() || t('dashboard.buyer'),
      buyerLocation: preferences?.location?.trim() || '—',
      quantity: qty,
    });
    const pay = await createMockPayment(order.id, order.totalAmount);
    setPaymentReceipt(pay);
    setOrderFor(null);
    setShowCheckout(false);
    setQty(1);
    await load();
  };

  const uniqueLocations = [...new Set(items.map((i) => i.farmerLocation))];

  return (
    <div className="p-4 space-y-4 pb-28">
      <h2 className="text-xl font-extrabold saarthi-headline text-[var(--saarthi-on-background)] flex items-center gap-2">
        <Search className="text-[var(--saarthi-primary)]" aria-hidden />
        {t('action.browseProduce')}
      </h2>

      <Card className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-bold text-[var(--saarthi-on-surface-variant)] mb-1 block">{t('buyer.filterCrop')}</label>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="saarthi-input cursor-pointer"
            >
              <option value="">{t('buyer.filterCrop')}…</option>
              {CROP_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--saarthi-on-surface-variant)] mb-1 block">{t('buyer.filterLocation')}</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="saarthi-input cursor-pointer"
            >
              <option value="">{t('buyer.filterLocation')}…</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card tonal className="text-center text-[var(--saarthi-on-surface-variant)] py-10">{t('produce.empty')}</Card>
          ) : (
            filtered.map((item) => (
              <Card key={item.id} className="space-y-3">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold saarthi-headline text-[var(--saarthi-on-background)]">{item.crop}</h3>
                    <p className="text-sm text-[var(--saarthi-on-surface-variant)] flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {item.farmerLocation}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.farmerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black flex items-center justify-end gap-0.5 text-[var(--saarthi-primary)]">
                      <IndianRupee className="w-5 h-5 opacity-70" />
                      {item.pricePerUnit}
                    </p>
                    <p className="text-[10px] text-gray-500">/{item.unit}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--saarthi-on-surface)]">
                  {item.quantity} {item.unit}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setChatFor(item)}
                    className="flex-1 min-h-[48px] rounded-xl bg-[var(--saarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--saarthi-outline-soft)] hover:bg-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> {tV2('v2.buyer.chat')}
                  </button>
                  <a
                    href={`tel:+${CONTACT.phoneE164}`}
                    className="flex-1 min-h-[48px] rounded-xl bg-[var(--saarthi-surface-low)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--saarthi-outline-soft)] text-[var(--saarthi-on-background)] hover:bg-white transition-colors"
                  >
                    <Phone className="w-4 h-4" /> {tV2('v2.buyer.call')}
                  </a>
                  <button
                    type="button"
                    disabled
                    title={tV2('v2.buyer.videoSoon')}
                    className="min-h-[48px] min-w-[52px] rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center border border-gray-200 cursor-not-allowed"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
                <V2Button
                  fullWidth
                  variant="primary"
                  type="button"
                  onClick={() => {
                    setOrderFor(item);
                    setQty(1);
                    setShowCheckout(false);
                  }}
                >
                  {t('buyer.order')}
                </V2Button>
              </Card>
            ))
          )}
        </div>
      )}

      {paymentReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md space-y-3">
            <p className="font-bold text-lg text-green-700">{t('buyer.paymentSuccess')}</p>
            <p className="text-xs text-gray-500">{paymentReceipt.orderId}</p>
            <p className="text-sm font-semibold">{t('buyer.splitTitle')}</p>
            <ul className="text-sm space-y-1 rounded-2xl p-3 bg-[var(--saarthi-surface-low)]">
              <li className="flex justify-between">
                <span>{t('buyer.splitFarmer')}</span>
                <span className="font-bold">₹{paymentReceipt.split.farmer}</span>
              </li>
              <li className="flex justify-between">
                <span>{t('buyer.splitLogistics')}</span>
                <span className="font-bold">₹{paymentReceipt.split.logistics}</span>
              </li>
              <li className="flex justify-between">
                <span>{t('buyer.splitPlatform')}</span>
                <span className="font-bold">₹{paymentReceipt.split.platform}</span>
              </li>
              <li className="flex justify-between pt-2 border-t border-[var(--saarthi-outline-soft)] font-extrabold">
                <span>{t('buyer.splitTotal')}</span>
                <span>₹{paymentReceipt.split.total}</span>
              </li>
            </ul>
            <V2Button type="button" fullWidth variant="secondary" onClick={() => setPaymentReceipt(null)}>
              {t('back')}
            </V2Button>
          </Card>
        </div>
      )}

      <PaymentCheckoutSheet
        open={Boolean(showCheckout && orderFor)}
        amountInr={orderTotal}
        cropLabel={orderFor ? `${orderFor.crop} × ${qty}` : ''}
        onClose={() => setShowCheckout(false)}
        onPaid={completeOrderAfterPay}
      />

      {chatFor && (
        <BuyerChatDrawer produceId={chatFor.id} farmerName={chatFor.farmerName} crop={chatFor.crop} onClose={() => setChatFor(null)} />
      )}

      {orderFor && !showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md space-y-4">
            <p className="font-extrabold text-lg saarthi-headline text-[var(--saarthi-primary)]">{orderFor.crop}</p>
            <label className="block text-sm font-bold text-[var(--saarthi-on-surface-variant)]">{t('produce.qty')}</label>
            <div className="flex flex-wrap gap-2">
              {QTY_PRESETS.filter((q) => q <= orderFor.quantity).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQty(q)}
                  className={`min-h-[44px] min-w-[56px] rounded-xl border-2 font-bold text-base transition-colors ${
                    qty === q ? 'bg-[var(--saarthi-primary)] text-white border-[var(--saarthi-primary)]' : 'bg-white text-gray-700 border-[var(--saarthi-outline-soft)]'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {orderFor.unit} (max {orderFor.quantity})
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" fullWidth variant="outline" onClick={() => setOrderFor(null)}>
                {t('back')}
              </Button>
              <V2Button
                type="button"
                fullWidth
                variant="primary"
                onClick={() => setShowCheckout(true)}
                bilingual={{
                  primary: tV2('v2.payment.continuePay'),
                  secondary: tV2('v2.payment.continuePayHi'),
                }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
