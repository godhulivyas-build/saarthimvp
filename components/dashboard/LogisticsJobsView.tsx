import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserPreferences, LogisticsJob, LogisticsJobStatus } from '../../types';
import {
  listLogisticsJobs,
  acceptLogisticsJob,
  updateLogisticsJobStatus,
} from '../../services/mvpDataService';
import { useI18n } from '../../i18n/I18nContext';
import { Loader2, Truck } from 'lucide-react';
import { PayoutBreakdown } from '../v2/ui/PayoutBreakdown';
import { CONTACT } from '../../config/contact';
import { buildWhatsAppLink, templateTestimonialRequest } from '../../services/whatsappTemplates';

type LogisticsJobsViewProps = {
  preferences: UserPreferences | null;
  refreshKey?: number;
  listMode?: 'open' | 'mine';
};

const driverId = 'me';

export const LogisticsJobsView: React.FC<LogisticsJobsViewProps> = ({
  preferences,
  refreshKey = 0,
  listMode = 'open',
}) => {
  const { t, lang } = useI18n();
  const [jobs, setJobs] = useState<LogisticsJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const name = preferences?.location?.trim() || t('dashboard.driver');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await listLogisticsJobs();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const visibleJobs = useMemo(() => {
    if (listMode === 'mine') {
      return jobs.filter((j) => j.acceptedByTransporterId === driverId);
    }
    return jobs.filter((j) => j.status === 'open');
  }, [jobs, listMode]);

  const onAccept = async (jobId: string) => {
    setBusy(jobId);
    await acceptLogisticsJob(jobId, driverId, name);
    setBusy(null);
    await load();
  };

  const onStatus = async (jobId: string, status: LogisticsJobStatus) => {
    setBusy(jobId);
    await updateLogisticsJobStatus(jobId, status);
    setBusy(null);
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Truck className="text-orange-600" aria-hidden />
        {listMode === 'mine' ? t('dashboard.myTrips') : t('jobs.title')}
      </h2>
      {visibleJobs.length === 0 ? (
        <p className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-dashed">{t('jobs.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {visibleJobs.map((job) => (
            <li key={job.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-2">
              <p className="font-bold text-gray-900">{job.crop}</p>
              <p className="text-sm text-gray-600">
                {job.quantity} {job.unit} · {job.pickupLocation} → {job.dropLocation}
              </p>
              <p className="text-xs text-gray-500">{job.farmerName}</p>
              {typeof job.estimatedFareInr === 'number' ? (
                <div className="mt-2">
                  <PayoutBreakdown
                    title={
                      lang === 'hi'
                        ? 'भुगतान विभाजन (पायलट)'
                        : lang === 'kn'
                          ? 'ಪಾವತಿ ವಿಭಜನೆ (ಪೈಲಟ್)'
                          : lang === 'ta'
                            ? 'கட்டணப் பிரிப்பு (பைலட்)'
                            : lang === 'te'
                              ? 'పేమెంట్ విడగొట్టు (పైలట్)'
                              : 'Payout split (pilot)'
                    }
                    split={{
                      logistics: job.estimatedFareInr - Math.round(job.estimatedFareInr * 0.05),
                      platform: Math.round(job.estimatedFareInr * 0.05),
                      total: job.estimatedFareInr,
                    }}
                    note={
                      lang === 'hi'
                        ? 'पायलट: प्लेटफ़ॉर्म फ़ीस + ड्राइवर भुगतान। बाद में वास्तविक कॉन्ट्रैक्ट से बदलें।'
                        : lang === 'kn'
                          ? 'ಪೈಲಟ್: ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕ + ಚಾಲಕ ಪಾವತಿ. ನಂತರ ನಿಜವಾದ ಒಪ್ಪಂದಗಳಿಂದ ಬದಲಾಯಿಸಿ.'
                          : lang === 'ta'
                            ? 'பைலட்: பிளாட்ஃபார்ம் கட்டணம் + டிரைவர் கட்டணம். பின்னர் உண்மை ஒப்பந்தத்துடன் மாற்றவும்.'
                            : lang === 'te'
                              ? 'పైలట్: ప్లాట్‌ఫారమ్ ఫీ + డ్రైవర్ పేమెంట్. తర్వాత నిజమైన కాంట్రాక్టులతో మార్చండి.'
                              : 'Pilot split: platform fee + driver payout. Replace with real contracts later.'
                    }
                  />
                </div>
              ) : null}
              <p className="text-xs font-semibold text-orange-700">{job.status}</p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={buildWhatsAppLink(
                    `Saarthi logistics (pilot)\nJob: ${job.id}\nRoute: ${job.pickupLocation} → ${job.dropLocation}\nCrop: ${job.crop}\nLoad: ${job.quantity} ${job.unit}\nStatus: ${job.status}\n\nPlease share any ops notes / gate pass info.`,
                    CONTACT.phoneE164
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] rounded-xl bg-[#25D366] text-white font-extrabold flex items-center justify-center text-sm"
                >
                  {lang === 'hi'
                    ? 'WhatsApp (ऑप्स)'
                    : lang === 'kn'
                      ? 'WhatsApp (ಆಪ್ಸ್)'
                      : lang === 'ta'
                        ? 'WhatsApp (ஆப்ஸ்)'
                        : lang === 'te'
                          ? 'WhatsApp (ఆప్స్)'
                          : 'WhatsApp ops'}
                </a>
                <a
                  href={buildWhatsAppLink(
                    templateTestimonialRequest({ role: 'logistics_partner', what: 'Job card clarity + payout split' }),
                    CONTACT.phoneE164
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] rounded-xl border-2 border-gray-200 bg-white text-gray-800 font-extrabold flex items-center justify-center text-sm"
                >
                  {lang === 'hi'
                    ? 'फ़ीडबैक'
                    : lang === 'kn'
                      ? 'ಪ್ರತಿಕ್ರಿಯೆ'
                      : lang === 'ta'
                        ? 'கருத்து'
                        : lang === 'te'
                          ? 'ఫీడ్‌బ్యాక్'
                          : 'Feedback'}
                </a>
              </div>
              {job.status === 'open' && listMode === 'open' && (
                <button
                  type="button"
                  disabled={busy === job.id}
                  onClick={() => onAccept(job.id)}
                  className="w-full min-h-[48px] rounded-xl bg-orange-600 text-white font-bold disabled:opacity-50"
                >
                  {busy === job.id ? '…' : t('jobs.accept')}
                </button>
              )}
              {job.status !== 'open' && job.status !== 'delivered' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">{t('jobs.status')}</label>
                  <select
                    value={job.status}
                    disabled={busy === job.id}
                    onChange={(e) => onStatus(job.id, e.target.value as LogisticsJobStatus)}
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  >
                    <option value="accepted">accepted</option>
                    <option value="picked_up">picked_up</option>
                    <option value="in_transit">in_transit</option>
                    <option value="delivered">delivered</option>
                  </select>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
