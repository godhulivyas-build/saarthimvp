import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { V2Button } from '../ui/V2Button';
import { TextField } from '../ui/TextField';
import { useI18n } from '../../../i18n/I18nContext';
import { appendBuyerChat, listBuyerChat, type BuyerChatMsg } from '../../../services/buyerChatService';
import { X } from 'lucide-react';

type Props = {
  produceId: string;
  farmerName: string;
  crop: string;
  onClose: () => void;
};

export const BuyerChatDrawer: React.FC<Props> = ({ produceId, farmerName, crop, onClose }) => {
  const { t, tV2, lang } = useI18n();
  const [rows, setRows] = useState<BuyerChatMsg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setRows(await listBuyerChat(produceId));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [produceId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t0 = text.trim();
    if (!t0) return;
    setText('');
    await appendBuyerChat(produceId, 'buyer', t0);
    await load();
    window.setTimeout(async () => {
      await appendBuyerChat(
        produceId,
        'farmer',
        lang === 'hi' ? 'नमस्ते, भाव बता दूँ?' : `Hello from ${farmerName} — I can confirm quantity for ${crop}.`
      );
      await load();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end sm:justify-center bg-black/45 p-0 sm:p-4">
      <Card className="w-full max-w-md mx-auto rounded-b-none sm:rounded-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--saarthi-outline-soft)]">
          <div>
            <p className="font-extrabold saarthi-headline text-[var(--saarthi-primary)]">{crop}</p>
            <p className="text-xs text-[var(--saarthi-on-surface-variant)]">{farmerName}</p>
          </div>
          <button type="button" className="p-2 rounded-xl hover:bg-[var(--saarthi-surface-low)]" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[var(--saarthi-surface-low)] min-h-[200px]">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-8">{t('common.loading')}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">{tV2('v2.buyer.chatEmpty')}</p>
          ) : (
            rows.map((m) => (
              <div
                key={m.id}
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === 'buyer' ? 'ml-auto bg-[var(--saarthi-primary)] text-white rounded-br-md' : 'mr-auto bg-white border border-[var(--saarthi-outline-soft)] rounded-bl-md'
                }`}
              >
                {m.text}
              </div>
            ))
          )}
        </div>
        <form onSubmit={send} className="p-4 border-t border-[var(--saarthi-outline-soft)] space-y-2 bg-white">
          <TextField value={text} onChange={(e) => setText(e.target.value)} placeholder={tV2('v2.buyer.chatPlaceholder')} />
          <V2Button type="submit" fullWidth variant="primary" disabled={!text.trim()}>
            {tV2('v2.buyer.chatSend')}
          </V2Button>
        </form>
      </Card>
    </div>
  );
};
