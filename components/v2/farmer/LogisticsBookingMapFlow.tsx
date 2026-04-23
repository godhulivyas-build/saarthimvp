import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useI18n } from '../../../i18n/I18nContext';
import { mapsEnabled, GOOGLE_MAPS_API_KEY } from '../../../services/maps/googleMapsConfig';
import { getDistrictByName, LOCATION_NAMES } from '../../../config/mpLocations';
import { listProduce, requestPickup } from '../../../services/mvpDataService';
import type { ProduceItem, UserPreferences } from '../../../types';
import { Button } from '../../ui/Button';
import { Loader2, MapPinned, Truck, ExternalLink, Mic, ArrowLeftRight, MapPin } from 'lucide-react';
import { BookingRouteMapInner } from '../maps/InteractiveBookingMap';
import { FallbackOsrmLeafletMap } from '../maps/FallbackOsrmLeafletMap';
import type { LatLng, DrivingRouteResult } from '../../../services/maps/routePlanning';
import { buildGoogleMapsDirUrl } from '../../../services/maps/routePlanning';
import { computeMoistureImpact } from '../../../services/moisturePriceModel';
import { PayoutBreakdown } from '../ui/PayoutBreakdown';
import { CONTACT } from '../../../config/contact';
import { buildWhatsAppLink, templateBookingConfirmation, templateTestimonialRequest } from '../../../services/whatsappTemplates';
import { useVoiceAssistant } from '../../../voice/VoiceAssistantProvider';

const CITY_OPTIONS = LOCATION_NAMES.slice(0, 28);

type Lang = 'hi' | 'en' | 'kn' | 'te';
type CopyKey =
  | 'title'
  | 'subtitle'
  | 'pickupTitle'
  | 'dropTitle'
  | 'useMyLocation'
  | 'enterVillage'
  | 'selectMandi'
  | 'selectBuyer'
  | 'manualAddress'
  | 'pickupMethods'
  | 'dropMethods'
  | 'gps'
  | 'village'
  | 'landmark'
  | 'mandi'
  | 'buyer'
  | 'optionsTitle'
  | 'returnTrip'
  | 'roundTrip'
  | 'fullTruck'
  | 'sharedLoad'
  | 'nearbyDrivers'
  | 'choose'
  | 'distance'
  | 'duration'
  | 'estimate'
  | 'minutes'
  | 'swap'
  | 'speakPickup'
  | 'speakDrop'
  | 'openNav'
  | 'osmNote'
  | 'produce'
  | 'quantity'
  | 'submit'
  | 'doneTitle'
  | 'bookingId'
  | 'waConfirm'
  | 'waFeedback'
  | 'moistureTitle'
  | 'moisture'
  | 'riskBand'
  | 'pilotNote'
  | 'returnLoad'
  | 'savings'
  | 'notGuaranteed';

const COPY: Record<Lang, Record<CopyKey, string>> = {
  hi: {
    title: 'ट्रांसपोर्ट बुकिंग',
    subtitle: 'पिकअप चुनें → ड्रॉप चुनें → ड्राइवर चुनें → बुकिंग',
    pickupTitle: 'पिकअप (कहाँ से उठाना है?)',
    dropTitle: 'ड्रॉप (कहाँ पहुँचाना है?)',
    useMyLocation: 'मेरी लोकेशन उपयोग करें',
    enterVillage: 'गाँव/इलाका लिखें',
    selectMandi: 'नज़दीकी मंडी चुनें',
    selectBuyer: 'खरीदार का पता चुनें',
    manualAddress: 'पता लिखें',
    pickupMethods: 'पिकअप विकल्प',
    dropMethods: 'ड्रॉप विकल्प',
    gps: 'GPS',
    village: 'गाँव',
    landmark: 'लैंडमार्क',
    mandi: 'मंडी',
    buyer: 'खरीदार',
    optionsTitle: 'अतिरिक्त विकल्प',
    returnTrip: 'रिटर्न ट्रिप चाहिए?',
    roundTrip: 'राउंड ट्रिप चाहिए?',
    fullTruck: 'फुल ट्रक लोड',
    sharedLoad: 'शेयर लोड',
    nearbyDrivers: 'नज़दीकी ड्राइवर',
    choose: 'चुनें',
    distance: 'दूरी',
    duration: 'समय',
    estimate: 'अनुमानित किराया',
    minutes: 'मिनट',
    swap: 'बदलें',
    speakPickup: 'पिकअप बोलें',
    speakDrop: 'ड्रॉप बोलें',
    openNav: 'नेविगेशन खोलें',
    osmNote: 'मैप सीमित है — फिर भी रूट दिखेगा।',
    produce: 'फसल चुनें',
    quantity: 'मात्रा',
    submit: 'बुकिंग भेजें',
    doneTitle: 'बुकिंग भेज दी गई',
    bookingId: 'बुकिंग आईडी',
    waConfirm: 'WhatsApp: बुकिंग पुष्टि',
    waFeedback: 'WhatsApp: फीडबैक',
    moistureTitle: 'गुणवत्ता (नमी/ग्रेड)',
    moisture: 'नमी (%)',
    riskBand: 'रिस्क बैंड',
    pilotNote: 'यह पायलट अनुमान है।',
    returnLoad: 'रिटर्न लोड (किलो)',
    savings: 'अनुमानित बचत',
    notGuaranteed: 'गारंटी नहीं — उपलब्धता पर निर्भर।',
  },
  en: {
    title: 'Transport booking',
    subtitle: 'Pick pickup → pick drop → choose driver → book',
    pickupTitle: 'Pickup (where to pick up?)',
    dropTitle: 'Drop (where to deliver?)',
    useMyLocation: 'Use my location',
    enterVillage: 'Enter village/area',
    selectMandi: 'Select nearby mandi',
    selectBuyer: 'Select buyer address',
    manualAddress: 'Enter address',
    pickupMethods: 'Pickup options',
    dropMethods: 'Drop options',
    gps: 'GPS',
    village: 'Village',
    landmark: 'Landmark',
    mandi: 'Mandi',
    buyer: 'Buyer',
    optionsTitle: 'Additional options',
    returnTrip: 'Need return trip?',
    roundTrip: 'Need round trip?',
    fullTruck: 'Full truck load',
    sharedLoad: 'Shared load',
    nearbyDrivers: 'Nearby drivers',
    choose: 'Choose',
    distance: 'Distance',
    duration: 'Duration',
    estimate: 'Estimated fare',
    minutes: 'min',
    swap: 'Swap',
    speakPickup: 'Speak pickup',
    speakDrop: 'Speak drop',
    openNav: 'Open navigation',
    osmNote: 'Map is limited — route still shows.',
    produce: 'Select crop',
    quantity: 'Quantity',
    submit: 'Submit booking',
    doneTitle: 'Booking submitted',
    bookingId: 'Booking ID',
    waConfirm: 'WhatsApp: booking confirmation',
    waFeedback: 'WhatsApp: feedback',
    moistureTitle: 'Quality (moisture/grade)',
    moisture: 'Moisture (%)',
    riskBand: 'Risk band',
    pilotNote: 'Pilot estimate.',
    returnLoad: 'Return load (kg)',
    savings: 'Estimated savings',
    notGuaranteed: 'Not guaranteed — depends on availability.',
  },
  kn: {
    title: 'ಸಾರಿಗೆ ಬುಕ್ಕಿಂಗ್',
    subtitle: 'ಪಿಕಪ್ → ಡ್ರಾಪ್ → ಚಾಲಕ → ಬುಕ್',
    pickupTitle: 'ಪಿಕಪ್ (ಎಲ್ಲಿಂದ?)',
    dropTitle: 'ಡ್ರಾಪ್ (ಎಲ್ಲಿಗೆ?)',
    useMyLocation: 'ನನ್ನ ಲೊಕೇಶನ್ ಬಳಸಿ',
    enterVillage: 'ಗ್ರಾಮ/ಪ್ರದೇಶ ಬರೆಯಿರಿ',
    selectMandi: 'ಹತ್ತಿರದ ಮಂಡಿ ಆಯ್ಕೆಮಾಡಿ',
    selectBuyer: 'ಖರೀದಿದಾರರ ವಿಳಾಸ ಆಯ್ಕೆಮಾಡಿ',
    manualAddress: 'ವಿಳಾಸ ಬರೆಯಿರಿ',
    pickupMethods: 'ಪಿಕಪ್ ಆಯ್ಕೆಗಳು',
    dropMethods: 'ಡ್ರಾಪ್ ಆಯ್ಕೆಗಳು',
    gps: 'GPS',
    village: 'ಗ್ರಾಮ',
    landmark: 'ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್',
    mandi: 'ಮಂಡಿ',
    buyer: 'ಖರೀದಿದಾರ',
    optionsTitle: 'ಹೆಚ್ಚುವರಿ ಆಯ್ಕೆಗಳು',
    returnTrip: 'ರಿಟರ್ನ್ ಟ್ರಿಪ್ ಬೇಕಾ?',
    roundTrip: 'ರೌಂಡ್ ಟ್ರಿಪ್ ಬೇಕಾ?',
    fullTruck: 'ಪೂರ್ಣ ಟ್ರಕ್ ಲೋಡ್',
    sharedLoad: 'ಹಂಚಿದ ಲೋಡ್',
    nearbyDrivers: 'ಹತ್ತಿರದ ಚಾಲಕರು',
    choose: 'ಆಯ್ಕೆಮಾಡಿ',
    distance: 'ದೂರ',
    duration: 'ಸಮಯ',
    estimate: 'ಅಂದಾಜು ಭಾಡೆ',
    minutes: 'ನಿಮಿಷ',
    swap: 'ಬದಲಿಸಿ',
    speakPickup: 'ಪಿಕಪ್ ಹೇಳಿ',
    speakDrop: 'ಡ್ರಾಪ್ ಹೇಳಿ',
    openNav: 'ನಾವಿಗೇಶನ್ ತೆರೆಯಿರಿ',
    osmNote: 'ಮ್ಯಾಪ್ ಮಿತಿ — ರೂಟ್ ಕಾಣಿಸುತ್ತದೆ.',
    produce: 'ಬೆಳೆ ಆಯ್ಕೆ',
    quantity: 'ಪ್ರಮಾಣ',
    submit: 'ಬುಕಿಂಗ್ ಕಳುಹಿಸಿ',
    doneTitle: 'ಬುಕಿಂಗ್ ಕಳುಹಿಸಲಾಗಿದೆ',
    bookingId: 'ಬುಕಿಂಗ್ ಐಡಿ',
    waConfirm: 'WhatsApp: ದೃಢೀಕರಣ',
    waFeedback: 'WhatsApp: ಪ್ರತಿಕ್ರಿಯೆ',
    moistureTitle: 'ಗುಣಮಟ್ಟ (ತೇವಾಂಶ/ಗ್ರೇಡ್)',
    moisture: 'ತೇವಾಂಶ (%)',
    riskBand: 'ರಿಸ್ಕ್ ಬ್ಯ್ಯಾಂಡ್',
    pilotNote: 'ಪೈಲಟ್ ಅಂದಾಜು.',
    returnLoad: 'ರಿಟರ್ನ್ ಲೋಡ್ (ಕೆಜಿ)',
    savings: 'ಅಂದಾಜು ಉಳಿತಾಯ',
    notGuaranteed: 'ಖಾತ್ರಿ ಇಲ್ಲ — ಲಭ್ಯತೆಯ ಮೇಲೆ ಅವಲಂಬಿತ.',
  },
  te: {
    title: 'రవాణా బుకింగ్',
    subtitle: 'పికప్ → డ్రాప్ → డ్రైవర్ → బుక్',
    pickupTitle: 'పికప్ (ఎక్కడి నుంచి?)',
    dropTitle: 'డ్రాప్ (ఎక్కడికి?)',
    useMyLocation: 'నా లొకేషన్ ఉపయోగించండి',
    enterVillage: 'గ్రామం/ప్రాంతం టైప్ చేయండి',
    selectMandi: 'సమీప మండీ ఎంచుకోండి',
    selectBuyer: 'ఖరీదుదారు చిరునామా ఎంచుకోండి',
    manualAddress: 'చిరునామా టైప్ చేయండి',
    pickupMethods: 'పికప్ ఎంపికలు',
    dropMethods: 'డ్రాప్ ఎంపికలు',
    gps: 'GPS',
    village: 'గ్రామం',
    landmark: 'ల్యాండ్‌మార్క్',
    mandi: 'మండీ',
    buyer: 'ఖరీదుదారు',
    optionsTitle: 'అదనపు ఎంపికలు',
    returnTrip: 'రిటర్న్ ట్రిప్ కావాలా?',
    roundTrip: 'రౌండ్ ట్రిప్ కావాలా?',
    fullTruck: 'ఫుల్ ట్రక్ లోడ్',
    sharedLoad: 'షేర్డ్ లోడ్',
    nearbyDrivers: 'సమీప డ్రైవర్లు',
    choose: 'ఎంచుకోండి',
    distance: 'దూరం',
    duration: 'సమయం',
    estimate: 'అంచనా కిరాయి',
    minutes: 'నిమిషాలు',
    swap: 'మార్చండి',
    speakPickup: 'పికప్ చెప్పండి',
    speakDrop: 'డ్రాప్ చెప్పండి',
    openNav: 'నావిగేషన్ తెరవండి',
    osmNote: 'మ్యాప్ పరిమితం — రూట్ కనిపిస్తుంది.',
    produce: 'పంట ఎంచుకోండి',
    quantity: 'పరిమాణం',
    submit: 'బుకింగ్ పంపండి',
    doneTitle: 'బుకింగ్ పంపబడింది',
    bookingId: 'బుకింగ్ ఐడి',
    waConfirm: 'WhatsApp: నిర్ధారణ',
    waFeedback: 'WhatsApp: ఫీడ్‌బ్యాక్',
    moistureTitle: 'నాణ్యత (తేమ/గ్రేడ్)',
    moisture: 'తేమ (%)',
    riskBand: 'రిస్క్ బ్యాండ్',
    pilotNote: 'పైలట్ అంచనా.',
    returnLoad: 'రిటర్న్ లోడ్ (కిలో)',
    savings: 'అంచనా ఆదా',
    notGuaranteed: 'హామీ లేదు — లభ్యతపై ఆధారపడుతుంది.',
  },
};

function getLang(raw: string): Lang {
  if (raw === 'hi' || raw === 'en' || raw === 'kn' || raw === 'te') return raw;
  return 'hi';
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

type Props = {
  preferences: UserPreferences | null;
  onDone?: () => void;
};

export const LogisticsBookingMapFlow: React.FC<Props> = ({ preferences, onDone }) => {
  const { t, tV2 } = useI18n();
  const { dictateOnce, listening } = useVoiceAssistant();
  const uiLang = getLang((useI18n() as any).lang ?? 'hi');
  const L = (k: CopyKey) => COPY[uiLang][k];
  const [from, setFrom] = useState(preferences?.location?.trim() || 'Indore');
  const [to, setTo] = useState('Bhopal');
  const [produce, setProduce] = useState<ProduceItem[]>([]);
  const [produceId, setProduceId] = useState('');
  const [qty, setQty] = useState(5);
  const [moisturePct, setMoisturePct] = useState(14);
  const [needReturn, setNeedReturn] = useState(false);
  const [returnLoadKg, setReturnLoadKg] = useState(250);
  const [needRoundTrip, setNeedRoundTrip] = useState(false);
  const [fullTruck, setFullTruck] = useState(true);
  const [sharedLoad, setSharedLoad] = useState(false);
  const [pickupMode, setPickupMode] = useState<'gps' | 'village' | 'mandi' | 'address'>('mandi');
  const [dropMode, setDropMode] = useState<'address' | 'mandi' | 'buyer'>('mandi');
  const [pickupText, setPickupText] = useState('');
  const [dropText, setDropText] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [placeMode, setPlaceMode] = useState<'pickup' | 'drop'>('pickup');
  const [routePath, setRoutePath] = useState<LatLng[] | null>(null);
  const [routeMeta, setRouteMeta] = useState<{ distanceKm: number; durationMin: number } | null>(null);

  useEffect(() => {
    listProduce().then((list) => {
      const now = new Date().toISOString();
      const seedCrops = (uiLang === 'hi'
        ? ['गेहूं', 'मक्का', 'प्याज', 'सोयाबीन', 'चना', 'टमाटर', 'आलू', 'सरसों', 'कपास', 'धान']
        : uiLang === 'kn'
          ? ['ಗೋಧಿ', 'ಮೆಕ್ಕೆಜೋಳ', 'ಈರುಳ್ಳಿ', 'ಸೋಯಾಬೀನ್', 'ಕಡಲೆ', 'ಟೊಮೇಟೋ', 'ಆಲೂಗಡ್ಡೆ', 'ಸಾಸಿವೆ', 'ಹತ್ತಿ', 'ಅಕ್ಕಿ']
          : uiLang === 'te'
            ? ['గోధుమ', 'మొక్కజొన్న', 'ఉల్లిపాయ', 'సోయాబీన్', 'సెనగ', 'టమాట', 'బంగాళాదుంప', 'ఆవాలు', 'పత్తి', 'వరి']
            : ['Wheat', 'Maize', 'Onion', 'Soybean', 'Chickpea', 'Tomato', 'Potato', 'Mustard', 'Cotton', 'Paddy']) as string[];

      const seeded: ProduceItem[] = seedCrops.map((crop) => ({
        id: `seed-${crop}`,
        farmerName: 'Saarthi',
        farmerLocation: preferences?.location?.trim() || 'India',
        crop,
        quantity: 0,
        unit: 'quintal',
        pricePerUnit: 0,
        createdAt: now,
      }));

      const other: ProduceItem = {
        id: 'seed-other',
        farmerName: 'Saarthi',
        farmerLocation: preferences?.location?.trim() || 'India',
        crop: uiLang === 'hi' ? 'अन्य लिखें' : uiLang === 'kn' ? 'ಇತರೆ (ಬರೆಯಿರಿ)' : uiLang === 'te' ? 'ఇతర (రాయండి)' : 'Other (type)',
        quantity: 0,
        unit: 'quintal',
        pricePerUnit: 0,
        createdAt: now,
      };

      const merged = [...seeded, other, ...list];
      setProduce(merged);
      if (merged[0]) setProduceId(merged[0].id);
      setLoading(false);
    });
  }, []);

  const pickupLL = useMemo((): LatLng => {
    const d = getDistrictByName(from);
    return d ? { lat: d.lat, lng: d.lng } : { lat: 22.72, lng: 75.86 };
  }, [from]);
  const dropLL = useMemo((): LatLng => {
    const d = getDistrictByName(to);
    return d ? { lat: d.lat, lng: d.lng } : { lat: 23.26, lng: 77.4 };
  }, [to]);

  const [pickAdjust, setPickAdjust] = useState<LatLng>(pickupLL);
  const [dropAdjust, setDropAdjust] = useState<LatLng>(dropLL);

  useEffect(() => {
    setPickAdjust(pickupLL);
    setDropAdjust(dropLL);
  }, [from, to, pickupLL, dropLL]);

  const onRouteComputed = useCallback((r: DrivingRouteResult | null) => {
    if (r && r.path.length > 0) {
      setRoutePath(r.path);
      setRouteMeta({ distanceKm: r.distanceKm, durationMin: r.durationMin });
    } else {
      setRoutePath(null);
      setRouteMeta(null);
    }
  }, []);

  const distanceKm = useMemo(() => {
    if (routeMeta) return Math.round(routeMeta.distanceKm * 10) / 10;
    return Math.round(haversineKm(pickAdjust, dropAdjust) * 10) / 10;
  }, [routeMeta, pickAdjust, dropAdjust]);

  const estimateInr = Math.max(800, Math.round(distanceKm * 42 * (1 + qty / 100)));
  const returnSavingsInr = useMemo(() => {
    if (!needReturn) return 0;
    // Pilot heuristic: a matched backhaul can reduce effective one-way cost by ~12–22%.
    const base = estimateInr;
    const pct = 0.16 + Math.min(0.06, Math.max(0, (returnLoadKg - 200) / 1000));
    return Math.round(base * Math.min(0.22, Math.max(0.12, pct)));
  }, [needReturn, estimateInr, returnLoadKg]);
  const split = useMemo(() => {
    const platform = Math.round(estimateInr * 0.05);
    const logistics = estimateInr - platform;
    return { logistics, platform, total: estimateInr };
  }, [estimateInr]);

  const selected = produce.find((p) => p.id === produceId);
  const moisture = useMemo(() => computeMoistureImpact(selected?.crop || 'Soybean', moisturePct), [selected?.crop, moisturePct]);

  const nearby = useMemo(
    () => [
      {
        id: '1',
        name: uiLang === 'hi' ? 'राजेश ट्रांसपोर्ट' : uiLang === 'kn' ? 'ರಾಜೇಶ್ ಟ್ರಾನ್ಸ್‌ಪೋರ್ಟ್' : uiLang === 'te' ? 'రాజేష్ ట్రాన్స్‌పోర్ట్' : 'Rajesh Transport',
        km: Math.max(2, Math.round(distanceKm * 0.15)),
        rating: 4.6,
        vehicle: uiLang === 'hi' ? 'ट्रक (12 टन)' : uiLang === 'kn' ? 'ಟ್ರಕ್ (12 ಟನ್)' : uiLang === 'te' ? 'ట్రక్ (12 టన్)' : 'Truck (12T)',
        etaMin: 18,
      },
      {
        id: '2',
        name: uiLang === 'hi' ? 'मोहन लॉजिस्टिक्स' : uiLang === 'kn' ? 'ಮೋಹನ್ ಲಾಜಿಸ್ಟಿಕ್ಸ್' : uiLang === 'te' ? 'మోహన్ లాజిస్టిక్స్' : 'Mohan Logistics',
        km: Math.max(3, Math.round(distanceKm * 0.22)),
        rating: 4.4,
        vehicle: uiLang === 'hi' ? 'पिकअप (7 टन)' : uiLang === 'kn' ? 'ಪಿಕಪ್ (7 ಟನ್)' : uiLang === 'te' ? 'పికప్ (7 టన్)' : 'Pickup (7T)',
        etaMin: 26,
      },
      {
        id: '3',
        name: uiLang === 'hi' ? 'शिव ट्रक सेवा' : uiLang === 'kn' ? 'ಶಿವ ಟ್ರಕ್ ಸೇವೆ' : uiLang === 'te' ? 'శివ ట్రక్ సేవ' : 'Shiv Truck Seva',
        km: Math.max(4, Math.round(distanceKm * 0.28)),
        rating: 4.5,
        vehicle: uiLang === 'hi' ? 'ट्रैक्टर ट्रॉली' : uiLang === 'kn' ? 'ಟ್ರಾಕ್ಟರ್ ಟ್ರಾಲಿ' : uiLang === 'te' ? 'ట్రాక్టర్ ట్రాలీ' : 'Tractor trolley',
        etaMin: 34,
      },
    ],
    [distanceKm, uiLang]
  );

  const navHref = buildGoogleMapsDirUrl(pickAdjust, dropAdjust);
  const bookingId = useMemo(() => `bk-${Date.now().toString(36)}`, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    await requestPickup({
      produceId: selected.id,
      farmerName: preferences?.location?.trim() || 'Farmer',
      pickupLocation: `${from} (${pickAdjust.lat.toFixed(4)},${pickAdjust.lng.toFixed(4)})`,
      dropLocation: `${to} (${dropAdjust.lat.toFixed(4)},${dropAdjust.lng.toFixed(4)})`,
      quantity: qty,
      unit: selected.unit,
      estimatedFareInr: estimateInr,
    });
    setSubmitting(false);
    setDone(true);
    onDone?.();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--saarthi-primary)]" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="p-6 text-center pb-24">
        <Truck className="w-14 h-14 text-[var(--saarthi-primary)] mx-auto mb-3" />
        <p className="text-lg font-bold">{L('doneTitle')} ✓</p>
        <p className="mt-2 text-xs text-[var(--saarthi-on-surface-variant)]">
          {L('bookingId')}: {bookingId}
        </p>
        <div className="mt-5 space-y-2">
          <a
            href={buildWhatsAppLink(
              templateBookingConfirmation({
                crop: selected?.crop || 'Crop',
                qty,
                unit: selected?.unit || 'unit',
                from,
                to,
                fareInr: estimateInr,
                moisturePct,
              }),
              CONTACT.phoneE164
            )}
            target="_blank"
            rel="noreferrer"
            className="block w-full min-h-[52px] rounded-2xl bg-[#25D366] text-white font-extrabold flex items-center justify-center"
          >
            {L('waConfirm')}
          </a>
          <a
            href={buildWhatsAppLink(
              templateTestimonialRequest({ role: 'farmer', what: 'Booking flow + price/moisture info' }),
              CONTACT.phoneE164
            )}
            target="_blank"
            rel="noreferrer"
            className="block w-full min-h-[52px] rounded-2xl border-2 border-[var(--saarthi-outline-soft)] bg-white text-[var(--saarthi-primary)] font-extrabold flex items-center justify-center"
          >
            {L('waFeedback')}
          </a>
        </div>
      </div>
    );
  }

  const mapCommonProps = {
    pickup: pickAdjust,
    drop: dropAdjust,
    onPickupChange: setPickAdjust,
    onDropChange: setDropAdjust,
    placeMode,
    routePath,
    onRouteComputed,
  };

  const mapBlock = mapsEnabled() ? (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']}>
      <BookingRouteMapInner
        {...mapCommonProps}
        pickupLabel={tV2('v2.maps.pickup')}
        dropLabel={tV2('v2.maps.drop')}
      />
    </APIProvider>
  ) : (
    <FallbackOsrmLeafletMap {...mapCommonProps} />
  );

  const useMyLocation = async () => {
    setGeoError(null);
    if (!('geolocation' in navigator)) {
      setGeoError(uiLang === 'hi' ? 'GPS उपलब्ध नहीं है' : uiLang === 'kn' ? 'GPS ಲಭ್ಯವಿಲ್ಲ' : uiLang === 'te' ? 'GPS అందుబాటులో లేదు' : 'GPS not available');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickAdjust(ll);
        setPickupMode('gps');
        setFrom(uiLang === 'hi' ? 'मेरी लोकेशन' : uiLang === 'kn' ? 'ನನ್ನ ಲೊಕೇಶನ್' : uiLang === 'te' ? 'నా లొకేషన్' : 'My location');
        // Minimal human-readable autofill (no reverse-geocode in MVP)
        setPickupText(uiLang === 'hi' ? 'ग्राम पिपलिया, इंदौर, मध्य प्रदेश' : uiLang === 'kn' ? 'ಪಿಪಲಿಯಾ ಗ್ರಾಮ, ಇಂದೋರ್, ಮಧ್ಯ ಪ್ರದೇಶ' : uiLang === 'te' ? 'పిప్లియా గ్రామం, ఇండోర్, మధ్యప్రదేశ్' : 'Pipliya village, Indore, MP');
      },
      () => {
        setGeoError(uiLang === 'hi' ? 'लोकेशन अनुमति नहीं मिली' : uiLang === 'kn' ? 'ಲೊಕೇಶನ್ ಅನುಮತಿ ಇಲ್ಲ' : uiLang === 'te' ? 'లొకేషన్ అనుమతి లేదు' : 'Location permission denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const toggleChip = (on: boolean, set: (v: boolean) => void) => set(!on);

  return (
    <form onSubmit={submit} className="p-4 space-y-4 pb-28">
      <div className="rounded-3xl border border-[var(--saarthi-outline-soft)] bg-white/90 backdrop-blur p-4">
        <h2 className="text-xl font-black flex items-center gap-2 saarthi-headline">
          <Truck className="text-[var(--saarthi-primary)]" />
          {L('title')}
        </h2>
        <p className="mt-1 text-sm font-bold text-[var(--saarthi-on-surface-variant)]">{L('subtitle')}</p>
      </div>

      {mapBlock}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPlaceMode('pickup')}
          className={`min-h-[48px] flex-1 min-w-[140px] rounded-2xl font-black text-sm border-2 ${
            placeMode === 'pickup'
              ? 'border-[var(--saarthi-primary)] bg-green-50 text-green-900'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          {L('pickupTitle')}
        </button>
        <button
          type="button"
          onClick={() => setPlaceMode('drop')}
          className={`min-h-[48px] flex-1 min-w-[140px] rounded-2xl font-black text-sm border-2 ${
            placeMode === 'drop'
              ? 'border-[var(--saarthi-secondary)] bg-orange-50 text-orange-900'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          {L('dropTitle')}
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-[var(--saarthi-outline-soft)] p-4 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-black text-base">
            {L('pickupTitle')} → {L('dropTitle')}
          </p>
          <button
            type="button"
            onClick={() => {
              setFrom(to);
              setTo(from);
              const p = pickAdjust;
              setPickAdjust(dropAdjust);
              setDropAdjust(p);
            }}
            className="min-h-[44px] px-4 rounded-2xl border border-[var(--saarthi-outline-soft)] bg-white text-sm font-black text-[var(--saarthi-primary)] inline-flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {L('swap')}
          </button>
        </div>

        {/* Pickup methods */}
        <div>
          <p className="text-sm font-black text-[var(--saarthi-on-background)]">{L('pickupMethods')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={useMyLocation} className="min-h-[48px] px-4 rounded-2xl bg-[var(--saarthi-primary)] text-white font-black shadow-sm">
              {L('useMyLocation')}
            </button>
            <button
              type="button"
              onClick={() => setPickupMode('village')}
              className={`min-h-[48px] px-4 rounded-2xl border font-black ${
                pickupMode === 'village' ? 'border-[var(--saarthi-primary)] bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              {L('enterVillage')}
            </button>
            <button
              type="button"
              onClick={() => setPickupMode('mandi')}
              className={`min-h-[48px] px-4 rounded-2xl border font-black ${
                pickupMode === 'mandi' ? 'border-[var(--saarthi-primary)] bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              {L('selectMandi')}
            </button>
            <button
              type="button"
              onClick={() => setPickupMode('address')}
              className={`min-h-[48px] px-4 rounded-2xl border font-black ${
                pickupMode === 'address' ? 'border-[var(--saarthi-primary)] bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              {L('manualAddress')}
            </button>
          </div>
          {geoError ? <p className="mt-2 text-xs font-bold text-red-600">{geoError}</p> : null}

          <div className="mt-3">
            {pickupMode === 'gps' ? (
              <div className="rounded-2xl border border-gray-200 bg-[var(--saarthi-surface-low)] px-4 py-3">
                <p className="text-xs font-extrabold text-[var(--saarthi-on-surface-variant)]">आपका स्थान</p>
                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[var(--saarthi-primary)] mt-0.5 shrink-0" />
                  <input
                    value={pickupText}
                    onChange={(e) => setPickupText(e.target.value)}
                    className="w-full min-h-[44px] rounded-2xl border border-gray-200 bg-white px-3 font-bold"
                    aria-label="आपका स्थान"
                  />
                </div>
              </div>
            ) : pickupMode === 'village' ? (
              <div className="relative">
                <input
                  value={pickupText}
                  onChange={(e) => setPickupText(e.target.value)}
                  placeholder={L('enterVillage')}
                  className="w-full min-h-[52px] rounded-2xl border-2 border-gray-200 px-4 bg-white"
                />
                <button
                  type="button"
                  disabled={listening}
                  onClick={() =>
                    dictateOnce({
                      onText: (txt) => setPickupText(txt.trim()),
                    })
                  }
                  className="absolute right-2 top-2 min-h-[40px] min-w-[40px] rounded-2xl bg-[var(--saarthi-primary)] text-white flex items-center justify-center disabled:opacity-60"
                  aria-label={L('speakPickup')}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            ) : pickupMode === 'address' ? (
              <input
                value={pickupText}
                onChange={(e) => setPickupText(e.target.value)}
                placeholder={L('manualAddress')}
                className="w-full min-h-[52px] rounded-2xl border-2 border-gray-200 px-4 bg-white"
              />
            ) : pickupMode === 'mandi' ? (
              <select
                className="w-full min-h-[52px] rounded-2xl border-2 border-gray-200 px-4 bg-white"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-[var(--saarthi-surface-low)] px-4 py-3 text-sm font-bold text-[var(--saarthi-on-surface-variant)]">
                {from}
              </div>
            )}
          </div>
        </div>

        {/* Drop methods */}
        <div>
          <p className="text-sm font-black text-[var(--saarthi-on-background)]">{L('dropMethods')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDropMode('address')}
              className={`min-h-[48px] px-4 rounded-2xl border font-black ${
                dropMode === 'address' ? 'border-[var(--saarthi-secondary)] bg-orange-50' : 'border-gray-200 bg-white'
              }`}
            >
              {L('manualAddress')}
            </button>
            <button
              type="button"
              onClick={() => setDropMode('mandi')}
              className={`min-h-[48px] px-4 rounded-2xl border font-black ${
                dropMode === 'mandi' ? 'border-[var(--saarthi-secondary)] bg-orange-50' : 'border-gray-200 bg-white'
              }`}
            >
              {L('mandi')}
            </button>
            <button
              type="button"
              onClick={() => setDropMode('buyer')}
              className={`min-h-[48px] px-4 rounded-2xl border font-black ${
                dropMode === 'buyer' ? 'border-[var(--saarthi-secondary)] bg-orange-50' : 'border-gray-200 bg-white'
              }`}
            >
              {L('buyer')}
            </button>
          </div>

          <div className="mt-3">
            {dropMode === 'address' ? (
              <div className="relative">
                <input
                  value={dropText}
                  onChange={(e) => setDropText(e.target.value)}
                  placeholder={L('manualAddress')}
                  className="w-full min-h-[52px] rounded-2xl border-2 border-gray-200 px-4 bg-white"
                />
                <button
                  type="button"
                  disabled={listening}
                  onClick={() =>
                    dictateOnce({
                      onText: (txt) => setDropText(txt.trim()),
                    })
                  }
                  className="absolute right-2 top-2 min-h-[40px] min-w-[40px] rounded-2xl bg-[var(--saarthi-primary)] text-white flex items-center justify-center disabled:opacity-60"
                  aria-label={L('speakDrop')}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <select
                className="w-full min-h-[52px] rounded-2xl border-2 border-gray-200 px-4 bg-white"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--saarthi-surface-low)] p-4 space-y-1 text-sm">
        <p>
          <span className="font-black">{L('distance')}:</span> {distanceKm} km
        </p>
        {routeMeta ? (
          <p>
            <span className="font-black">{L('duration')}:</span> {Math.round(routeMeta.durationMin)} {L('minutes')}
          </p>
        ) : null}
        <p>
          <span className="font-black">{L('estimate')}:</span> ₹{estimateInr}
        </p>
      </div>

      {/* Options */}
      <div className="rounded-3xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
        <p className="text-base font-black text-[var(--saarthi-on-background)]">{L('optionsTitle')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { on: needReturn, set: setNeedReturn, label: L('returnTrip') },
            { on: needRoundTrip, set: setNeedRoundTrip, label: L('roundTrip') },
            { on: fullTruck, set: setFullTruck, label: L('fullTruck') },
            { on: sharedLoad, set: setSharedLoad, label: L('sharedLoad') },
          ].map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => toggleChip(c.on, c.set)}
              className={`min-h-[48px] px-4 rounded-2xl border font-black ${
                c.on ? 'border-[var(--saarthi-primary)] bg-green-50 text-green-900' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nearby drivers */}
      <div className="rounded-3xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
        <p className="text-base font-black text-[var(--saarthi-on-background)]">{L('nearbyDrivers')}</p>
        <div className="mt-3 grid gap-3">
          {nearby.map((d) => {
            const selected = selectedDriverId === d.id;
            return (
              <div key={d.id} className={`rounded-2xl border px-4 py-3 ${selected ? 'border-[var(--saarthi-primary)] bg-green-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[var(--saarthi-on-background)]">{d.name}</p>
                    <p className="mt-0.5 text-xs font-bold text-[var(--saarthi-on-surface-variant)]">
                      ~{d.km} km • ★{d.rating} • {d.vehicle}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[var(--saarthi-on-surface-variant)]">
                      ETA: {d.etaMin} {L('minutes')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDriverId(d.id)}
                    className={`min-h-[44px] px-4 rounded-2xl font-black ${
                      selected ? 'bg-[var(--saarthi-primary)] text-white' : 'bg-[var(--saarthi-surface-low)] text-[var(--saarthi-primary)] border border-[var(--saarthi-outline-soft)]'
                    }`}
                  >
                    {L('choose')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <a
        href={navHref}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 min-h-[52px] w-full rounded-2xl border-2 border-[var(--saarthi-primary)] text-[var(--saarthi-primary)] font-black text-sm bg-white hover:bg-green-50 transition-colors"
      >
        <ExternalLink className="w-4 h-4 shrink-0" />
        {L('openNav')}
      </a>

      {!mapsEnabled() ? (
        <p className="text-xs text-gray-500 flex items-start gap-2">
          <MapPinned className="w-4 h-4 shrink-0 mt-0.5" />
          {L('osmNote')}
        </p>
      ) : null}

      <div className="rounded-2xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
        <p className="font-black text-sm">{L('moistureTitle')}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600">{L('moisture')}</label>
            <input
              className="w-full mt-1 min-h-[48px] rounded-xl border-2 border-gray-200 px-3 bg-white"
              type="number"
              min={0}
              max={40}
              step={0.5}
              value={moisturePct}
              onChange={(e) => setMoisturePct(Number(e.target.value) || 0)}
            />
          </div>
          <div className="rounded-2xl border border-gray-100 bg-[var(--saarthi-surface-low)] p-3">
            <p className="text-xs font-bold text-gray-700">{L('riskBand')}</p>
            <p className="text-sm font-extrabold text-[var(--saarthi-primary)] mt-1">{moisture.band.toUpperCase()}</p>
            <p className="text-[10px] text-gray-500 mt-1">{moisture.note}</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-gray-500">
          {L('pilotNote')}
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
        <p className="font-black text-sm">{L('returnTrip')}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <label className="text-sm font-bold text-gray-700">{L('returnTrip')}</label>
          <button
            type="button"
            onClick={() => setNeedReturn((v) => !v)}
            className={`min-h-[40px] px-4 rounded-full font-extrabold text-sm transition-colors ${
              needReturn ? 'bg-[var(--saarthi-primary)] text-white' : 'bg-[var(--saarthi-surface-low)] text-[var(--saarthi-on-surface)]'
            }`}
          >
            {needReturn ? '✓' : '—'}
          </button>
        </div>
        {needReturn ? (
          <div className="mt-3 grid grid-cols-2 gap-3 items-start">
            <div>
              <label className="text-xs font-bold text-gray-600">{L('returnLoad')}</label>
              <input
                className="w-full mt-1 min-h-[48px] rounded-xl border-2 border-gray-200 px-3 bg-white"
                type="number"
                min={50}
                step={50}
                value={returnLoadKg}
                onChange={(e) => setReturnLoadKg(Number(e.target.value) || 50)}
              />
              <p className="mt-1 text-[10px] text-gray-500">{L('pilotNote')}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-[var(--saarthi-surface-low)] p-3">
              <p className="text-xs font-bold text-gray-700">{L('savings')}</p>
              <p className="text-2xl font-extrabold text-[var(--saarthi-primary)] mt-1">₹{returnSavingsInr}</p>
              <p className="text-[10px] text-gray-500 mt-1">{L('notGuaranteed')}</p>
            </div>
          </div>
        ) : null}
      </div>

      {selected && (
        <>
          <label className="text-sm font-black">{L('produce')}</label>
          <select className="w-full min-h-[48px] rounded-xl border-2 px-2 bg-white" value={produceId} onChange={(e) => setProduceId(e.target.value)}>
            {produce.map((p) => (
              <option key={p.id} value={p.id}>
                {p.crop}
              </option>
            ))}
          </select>
          <label className="text-sm font-black">{L('quantity')}</label>
          <input
            type="number"
            min={1}
            className="w-full min-h-[48px] rounded-xl border-2 px-3 bg-white"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value) || 1)}
          />
        </>
      )}
      <Button type="submit" fullWidth className="min-h-[56px] rounded-2xl" disabled={submitting || !selected}>
        {submitting ? '…' : L('submit')}
      </Button>
    </form>
  );
};
