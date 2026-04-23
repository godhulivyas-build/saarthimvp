import type { Lang } from '../i18n/translations';
import type {
  BuyerDashboardView,
  ColdStorageDashboardView,
  FarmerDashboardView,
  LogisticsDashboardView,
} from '../types';

type VoiceRow = Partial<Record<Lang, string>>;

export const landingVoice: VoiceRow = {
  hi: 'सारथी सेतु — किसान, खरीदार, लॉजिस्टिक्स और कोल्ड स्टोरेज एक साथ।',
  en: 'Sarthi Setu — farmers, buyers, logistics and cold storage together.',
  kn: 'Sarthi Setu — farmers, buyers, logistics.',
  te: 'Sarthi Setu — farmers, buyers, logistics.',
};

const row = (hi: string, en: string): VoiceRow => ({ hi, en, kn: en, te: en });

const mini = (hi: string, en: string): VoiceRow => row(hi, en);

export const voiceContent: {
  farmer: Record<FarmerDashboardView, VoiceRow>;
  logistics_partner: Record<LogisticsDashboardView, VoiceRow>;
  buyer: Record<BuyerDashboardView, VoiceRow>;
  cold_storage_owner: Record<ColdStorageDashboardView, VoiceRow>;
} = {
  farmer: {
    home: mini('किसान होम। मंडी भाव, मौसम, बुकिंग।', 'Farmer home. Mandi, weather, booking.'),
    book_vehicle: mini('गाड़ी बुक — नक्शा पर पिकअप और ड्रॉप चुनें।', 'Book logistics — pick pickup and drop on the map.'),
    my_requests: mini('आपकी रिक्वेस्ट।', 'Your requests.'),
    weather: mini('मौसम।', 'Weather.'),
    prices: mini('मंडी भाव।', 'Mandi prices.'),
    alerts: mini('सूचनाएं।', 'Alerts.'),
    nearby_buyers: mini('नज़दीकी खरीदार।', 'Nearby buyers.'),
    cold_nearby: mini('नज़दीकी कोल्ड स्टोरेज।', 'Nearby cold storage.'),
    wallet: mini('वॉलेट।', 'Wallet.'),
    payments: mini('भुगतान।', 'Payments.'),
    track: mini('ट्रैकिंग।', 'Shipment tracking.'),
  },
  logistics_partner: {
    home: mini('लॉजिस्टिक्स होम।', 'Logistics home.'),
    jobs: mini('नई बुकिंग।', 'New bookings.'),
    my_trips: mini('मेरी ट्रिप।', 'My trips.'),
    earnings: mini('कमाई।', 'Earnings.'),
    wallet: mini('वॉलेट।', 'Wallet.'),
  },
  buyer: {
    home: mini('खरीदार होम।', 'Buyer home.'),
    browse: mini('फसल ब्राउज़।', 'Browse produce.'),
    orders: mini('ऑर्डर।', 'Orders.'),
    wallet: mini('वॉलेट।', 'Wallet.'),
    payments: mini('भुगतान।', 'Payments.'),
  },
  cold_storage_owner: {
    home: mini('कोल्ड स्टोरेज होम।', 'Cold storage home.'),
    slots: mini('स्लॉट।', 'Slots.'),
    requests: mini('अनुरोध।', 'Requests.'),
    earnings: mini('कमाई।', 'Earnings.'),
  },
};

export const voiceForView = (
  role: 'farmer' | 'buyer' | 'logistics_partner' | 'cold_storage_owner',
  view: string,
  lang: Lang
): string => {
  const block = voiceContent[role] as Record<string, VoiceRow>;
  const r = block[view];
  return r?.[lang] ?? r?.hi ?? r?.en ?? landingVoice[lang] ?? '';
};
