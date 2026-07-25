import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Loader2, Phone, ShieldCheck, Users, MessageSquare, X, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useTr } from '../../i18n/useTr';
import { AppHeader } from '../shared/AppHeader';
import { TestimonialsSection } from '../landing/TestimonialsSection';
import { CROP_CATALOG, type CropCategory, type CropDef } from '../../services/cropCatalog';
import { MP_DISTRICTS } from '../../config/mpLocations';
import { getMandiPriceForCrop, type MandiPrice } from '../../services/mandiPriceService';
import { listAllBuyers, type Buyer } from '../../services/buyerDirectory';
import { listTransportersForDistrict, type Transporter } from '../../services/transporterDirectory';
import { computeSaarthiPrice } from '../../services/saarthiPriceService';
import { registeredFarmerCount } from '../../services/farmerRegistry';
import { submitProduceInquiry } from '../../services/produceOrderService';

const CATEGORY_LABEL: Record<CropCategory, { en: string; hi: string; kn: string; te: string; ta: string }> = {
  grain: { en: 'Grains', hi: 'अनाज', kn: 'ಧಾನ್ಯಗಳು', te: 'ధాన్యాలు', ta: 'தானியங்கள்' },
  pulse: { en: 'Pulses', hi: 'दालें', kn: 'ಬೇಳೆಕಾಳುಗಳು', te: 'పప్పులు', ta: 'பருப்பு வகைகள்' },
  oilseed: { en: 'Oilseeds', hi: 'तिलहन', kn: 'ಎಣ್ಣೆಬೀಜಗಳು', te: 'నూనె గింజలు', ta: 'எண்ணெய் வித்துக்கள்' },
  vegetable: { en: 'Vegetables', hi: 'सब्ज़ियाँ', kn: 'ತರಕಾರಿಗಳು', te: 'కూరగాయలు', ta: 'காய்கறிகள்' },
  fruit: { en: 'Fruits', hi: 'फल', kn: 'ಹಣ್ಣುಗಳು', te: 'పండ్లు', ta: 'பழங்கள்' },
  spice: { en: 'Spices', hi: 'मसाले', kn: 'ಮಸಾಲೆಗಳು', te: 'మసాలాలు', ta: 'மசாலாப் பொருட்கள்' },
};

type CropCard = {
  crop: CropDef;
  govt: MandiPrice | null;
  isSampleGovt: boolean;
  saarthiPrice: number | null;
};

export const SarthiBazaar: React.FC = () => {
  const { lang, t } = useI18n();
  const tr = useTr();
  const isHi = lang !== 'en';

  const [activeCategory, setActiveCategory] = useState<CropCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CropCard[]>([]);

  const [modalCrop, setModalCrop] = useState<CropDef | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Dewas');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [buyers, transporters] = await Promise.all([listAllBuyers(), listTransportersForDistrict()]);
      const refPoint = MP_DISTRICTS.find((d) => d.name === 'Dewas') ?? MP_DISTRICTS[0];

      const results: CropCard[] = [];
      for (const crop of CROP_CATALOG) {
        const govt = await getMandiPriceForCrop(crop.key, 'Madhya Pradesh');
        const buyerMatch = buyers.find((b: Buyer) => b.crops.some((c) => c.crop === crop.key));
        let saarthiPrice: number | null = null;
        if (buyerMatch) {
          const cropPrice = buyerMatch.crops.find((c) => c.crop === crop.key)!;
          if (buyerMatch.lat != null && buyerMatch.lng != null) {
            const sp = computeSaarthiPrice(
              { buyer: buyerMatch, offerPricePerQuintal: cropPrice.pricePerQuintal, vsGovtPercent: null, distanceKm: null },
              { lat: refPoint.lat, lng: refPoint.lng },
              transporters as Transporter[],
              null,
              govt.price?.modalPrice ?? null
            );
            saarthiPrice = sp.netPricePerQuintal;
          }
        }
        results.push({ crop, govt: govt.price, isSampleGovt: govt.isSample, saarthiPrice });
      }
      if (!cancelled) {
        setCards(results);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCards = activeCategory === 'all' ? cards : cards.filter((c) => c.crop.category === activeCategory);

  const openInquiry = (crop: CropDef) => {
    setModalCrop(crop);
    setQuantity('1');
    setName('');
    setPhone('');
    setSubmitted(false);
    setSubmitError('');
  };

  const closeInquiry = () => setModalCrop(null);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCrop) return;
    if (!name || phone.length !== 10) {
      setSubmitError(tr('Enter your name and a valid 10-digit phone number.', 'अपना नाम और वैध 10-अंकों का फ़ोन नंबर दर्ज करें।', 'ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಮಾನ್ಯ 10-ಅಂಕಿಯ ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.', 'మీ పేరు మరియు చెల్లుబాటు అయ్యే 10-అంకెల ఫోన్ నంబర్ నమోదు చేయండి.', 'உங்கள் பெயர் மற்றும் செல்லுபடியாகும் 10-இலக்க தொலைபேசி எண்ணை உள்ளிடவும்.'));
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    const result = await submitProduceInquiry({
      crop: modalCrop.key,
      quantityQuintal: Number(quantity) || 1,
      buyerName: name,
      buyerPhone: phone,
      district,
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error ?? tr('Could not submit. Please try again.', 'सबमिट नहीं हो सका। दोबारा कोशिश करें।', 'ಸಲ್ಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', 'సమర్పించలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.', 'சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'));
      return;
    }
    setSubmitted(true);
  };

  const cropLabel = (c: CropDef) => (isHi ? c.hi : c.en);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen font-['Lexend']">
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-4">
            {tr('Farm to your door', 'खेत से आपके दरवाज़े तक', 'ಹೊಲದಿಂದ ನಿಮ್ಮ ಬಾಗಿಲಿಗೆ', 'పొలం నుండి మీ ఇంటి తలుపు వరకు', 'வயலிலிருந்து உங்கள் வீட்டு வாசல் வரை')}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-950 dark:text-white tracking-tight mb-4">
            {tr('Sarthi Bazaar', 'सारथी बाज़ार', 'ಸಾರಥಿ ಬಜಾರ್', 'సార్థి బజార్', 'சார்தி பஜார்')}
          </h1>
          <p className="max-w-2xl mx-auto text-emerald-800/80 dark:text-emerald-200/80 text-lg leading-relaxed">
            {tr(
              'Real crops from our real farmer network in Khargone, Madhya Pradesh — priced honestly against today\'s government mandi rate. No middlemen markup, no invented numbers.',
              'खरगोन, मध्य प्रदेश के हमारे असली किसान नेटवर्क से असली फसलें — आज के सरकारी मंडी भाव के आधार पर ईमानदारी से कीमत तय। कोई बिचौलिया मार्कअप नहीं, कोई मनगढ़ंत आंकड़े नहीं।',
              'ಖರ್ಗೋನ್, ಮಧ್ಯಪ್ರದೇಶದ ನಮ್ಮ ನಿಜವಾದ ರೈತ ಜಾಲದಿಂದ ನಿಜವಾದ ಬೆಳೆಗಳು — ಇಂದಿನ ಸರ್ಕಾರಿ ಮಂಡಿ ದರಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಪ್ರಾಮಾಣಿಕ ಬೆಲೆ.',
              'ఖర్గోన్, మధ్యప్రదేశ్‌లోని మా నిజమైన రైతు నెట్‌వర్క్ నుండి నిజమైన పంటలు — నేటి ప్రభుత్వ మండీ ధరకు అనుగుణంగా నిజాయితీగా ధర నిర్ణయించబడింది.',
              'கார்கோன், மத்தியப் பிரதேசத்தில் உள்ள எங்கள் உண்மையான விவசாயி நெட்வொர்க்கிலிருந்து உண்மையான பயிர்கள் — இன்றைய அரசு மண்டி விலைக்கு ஏற்ப நேர்மையாக விலை நிர்ணயிக்கப்பட்டது.'
            )}
          </p>
        </div>
      </section>

      {/* Real trust stats — Sarthi's own numbers only */}
      <section className="border-y border-emerald-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-slate-900/50 py-8">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-black text-emerald-800 dark:text-emerald-300">{registeredFarmerCount()}+</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">{tr('Registered Farmers', 'पंजीकृत किसान', 'ನೋಂದಾಯಿತ ರೈತರು', 'నమోదిత రైతులు', 'பதிவு செய்யப்பட்ட விவசாயிகள்')}</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-emerald-800 dark:text-emerald-300">50+</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">{tr('Farmers Interviewed', 'किसानों से बातचीत', 'ರೈತರೊಂದಿಗೆ ಮಾತುಕತೆ', 'రైతులతో సంభాషణ', 'விவசாயிகளுடன் உரையாடல்')}</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-emerald-800 dark:text-emerald-300">17</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">{tr('WhatsApp Community', 'WhatsApp समुदाय', 'WhatsApp ಸಮುದಾಯ', 'WhatsApp సంఘం', 'WhatsApp சமூகம்')}</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-emerald-800 dark:text-emerald-300">5</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">{tr('Languages Supported', 'भाषाएँ समर्थित', 'ಬೆಂಬಲಿತ ಭಾಷೆಗಳು', 'మద్దతు ఉన్న భాషలు', 'ஆதரிக்கப்படும் மொழிகள்')}</div>
          </div>
        </div>
      </section>

      {/* Category filters */}
      <section className="py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                activeCategory === 'all'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
              }`}
            >
              {tr('All', 'सभी', 'ಎಲ್ಲಾ', 'అన్నీ', 'அனைத்தும்')}
            </button>
            {(Object.keys(CATEGORY_LABEL) as CropCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                  activeCategory === cat
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
              >
                {tr(CATEGORY_LABEL[cat].en, CATEGORY_LABEL[cat].hi, CATEGORY_LABEL[cat].kn, CATEGORY_LABEL[cat].te, CATEGORY_LABEL[cat].ta)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleCards.map(({ crop, govt, isSampleGovt, saarthiPrice }) => (
                <div
                  key={crop.key}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{cropLabel(crop)}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {tr('Mandi', 'मंडी', 'ಮಂಡಿ', 'మండీ', 'மண்டி')}: {govt ? `₹${govt.modalPrice}` : '—'}
                    {isSampleGovt && <span className="ml-1 text-amber-600">({tr('sample', 'नमूना', 'ಮಾದರಿ', 'నమూనా', 'மாதிரி')})</span>}
                  </div>
                  <div className="mb-3">
                    {saarthiPrice !== null ? (
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                        ₹{saarthiPrice} <span className="text-xs font-medium text-slate-400">/{tr('quintal', 'क्विंटल', 'ಕ್ವಿಂಟಲ್', 'క్వింటాల్', 'குவிண்டால்')}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        {tr('Ask for price', 'भाव पूछें', 'ಬೆಲೆ ಕೇಳಿ', 'ధర అడగండి', 'விலை கேளுங்கள்')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => openInquiry(crop)}
                    className="mt-auto w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-colors"
                  >
                    {tr('Order Now', 'अभी ऑर्डर करें', 'ಈಗ ಆರ್ಡರ್ ಮಾಡಿ', 'ఇప్పుడే ఆర్డర్ చేయండి', 'இப்போது ஆர்டர் செய்யுங்கள்')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="py-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        {tr(
          'Honest by design — Saarthi Price is only shown when a real registered buyer offer exists.',
          'ईमानदार डिज़ाइन — सारथी भाव तभी दिखाया जाता है जब असली पंजीकृत खरीदार ऑफर मौजूद हो।',
          'ಪ್ರಾಮಾಣಿಕ ವಿನ್ಯಾಸ — ನಿಜವಾದ ನೋಂದಾಯಿತ ಖರೀದಿದಾರರ ಆಫರ್ ಇದ್ದಾಗ ಮಾತ್ರ ಸಾರಥಿ ಬೆಲೆ ತೋರಿಸಲಾಗುತ್ತದೆ.',
          'నిజాయితీ డిజైన్ — నిజమైన నమోదిత కొనుగోలుదారు ఆఫర్ ఉన్నప్పుడు మాత్రమే సార్థి ధర చూపబడుతుంది.',
          'நேர்மையான வடிவமைப்பு — உண்மையான பதிவுசெய்யப்பட்ட வாங்குபவர் சலுகை இருந்தால் மட்டுமே சார்தி விலை காட்டப்படும்.'
        )}
      </div>

      <TestimonialsSection />

      {/* Inquiry modal */}
      {modalCrop && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={closeInquiry}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeInquiry} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <p className="font-bold text-slate-900 dark:text-white mb-1">
                  {tr('Request sent!', 'अनुरोध भेजा गया!', 'ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ!', 'అభ్యర్థన పంపబడింది!', 'கோரிக்கை அனுப்பப்பட்டது!')}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tr(
                    "We'll call you to confirm and arrange payment & delivery.",
                    'हम पुष्टि करने और भुगतान व डिलीवरी की व्यवस्था के लिए आपको कॉल करेंगे।',
                    'ದೃಢೀಕರಿಸಲು ಮತ್ತು ಪಾವತಿ ಮತ್ತು ವಿತರಣೆ ವ್ಯವಸ್ಥೆ ಮಾಡಲು ನಾವು ನಿಮಗೆ ಕರೆ ಮಾಡುತ್ತೇವೆ.',
                    'నిర్ధారించడానికి మరియు చెల్లింపు & డెలివరీని ఏర్పాటు చేయడానికి మేము మీకు కాల్ చేస్తాము.',
                    'உறுதிப்படுத்தவும் கட்டணம் & விநியோகத்தை ஏற்பாடு செய்யவும் நாங்கள் உங்களை அழைப்போம்.'
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{cropLabel(modalCrop)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
                  {tr(
                    "We'll call to confirm details and arrange payment — this isn't a live checkout yet.",
                    'हम विवरण की पुष्टि करने और भुगतान की व्यवस्था के लिए कॉल करेंगे — यह अभी लाइव चेकआउट नहीं है।',
                    'ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಲು ಮತ್ತು ಪಾವತಿ ವ್ಯವಸ್ಥೆ ಮಾಡಲು ನಾವು ಕರೆ ಮಾಡುತ್ತೇವೆ — ಇದು ಇನ್ನೂ ಲೈವ್ ಚೆಕ್‌ಔಟ್ ಅಲ್ಲ.',
                    'వివరాలను నిర్ధారించడానికి మరియు చెల్లింపును ఏర్పాటు చేయడానికి మేము కాల్ చేస్తాము — ఇది ఇంకా లైవ్ చెక్‌అవుట్ కాదు.',
                    'விவரங்களை உறுதிப்படுத்தவும் கட்டணத்தை ஏற்பாடு செய்யவும் நாங்கள் அழைப்போம் — இது இன்னும் நேரடி செக்அவுட் அல்ல.'
                  )}
                </p>
                {submitError && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{tr('Your Name', 'आपका नाम', 'ನಿಮ್ಮ ಹೆಸರು', 'మీ పేరు', 'உங்கள் பெயர்')}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="sarthi-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{tr('Phone Number', 'फ़ोन नंबर', 'ಫೋನ್ ಸಂಖ್ಯೆ', 'ఫోన్ నంబర్', 'தொலைபேசி எண்')}</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={10} pattern="[0-9]{10}" className="sarthi-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{tr('Quantity (quintal)', 'मात्रा (क्विंटल)', 'ಪ್ರಮಾಣ (ಕ್ವಿಂಟಲ್)', 'పరిమాణం (క్వింటాల్)', 'அளவு (குவிண்டால்)')}</label>
                  <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min="1" required className="sarthi-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{tr('District', 'ज़िला', 'ಜಿಲ್ಲೆ', 'జిల్లా', 'மாவட்டம்')}</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} className="sarthi-input w-full cursor-pointer">
                    {MP_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {isHi ? d.nameHi : d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                  {tr('Send Request', 'अनुरोध भेजें', 'ವಿನಂತಿ ಕಳುಹಿಸಿ', 'అభ్యర్థన పంపండి', 'கோரிக்கையை அனுப்பு')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
