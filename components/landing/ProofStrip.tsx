import React from 'react';
import { Card } from '../v2/ui/Card';
import { ShieldCheck, Sparkles, Camera, MessagesSquare, MapPinned } from 'lucide-react';

export const ProofStrip: React.FC<{
  images?: { src: string; alt?: string }[];
  headline?: string;
  stats?: { k: string; v: string }[];
}> = ({
  images = [],
  headline = 'Built with farmers (proof)',
  stats = [
    { k: 'Interviews', v: '15+ (documented)' },
    { k: 'Markets', v: 'APMC + local traders' },
    { k: 'Ops', v: 'WhatsApp-first pilot' },
  ],
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[var(--sarthi-surface)] via-white to-[var(--sarthi-surface-low)]">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--sarthi-primary)] opacity-10 blur-2xl" />
        <div className="absolute -bottom-14 -left-14 w-48 h-48 rounded-full bg-[var(--sarthi-secondary)] opacity-10 blur-2xl" />

        <div className="flex items-start justify-between gap-4 flex-wrap relative">
          <div className="min-w-0">
            <p className="font-extrabold sarthi-headline flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-white border border-[var(--sarthi-outline-soft)] shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[var(--sarthi-primary)]" />
              </span>
              <span className="min-w-0">{headline}</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full bg-white border border-[var(--sarthi-outline-soft)] text-[var(--sarthi-on-surface-variant)]">
                <Sparkles className="w-3.5 h-3.5" />
                Pilot proof
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--sarthi-on-surface-variant)] max-w-2xl">
              We surface credibility without exposing personal phone numbers, exact locations, or private data.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { Icon: MessagesSquare, t: 'Interviews & calls' },
                { Icon: MapPinned, t: 'Market observations' },
                { Icon: Camera, t: 'Field photos (curated)' },
              ].map(({ Icon, t }) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 border border-[var(--sarthi-outline-soft)] text-xs font-bold text-[var(--sarthi-on-background)] shadow-sm"
                >
                  <Icon className="w-4 h-4 text-[var(--sarthi-primary)]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-[44px] px-4 rounded-2xl border border-[var(--sarthi-outline-soft)] bg-white text-sm font-extrabold text-[var(--sarthi-primary)] hover:bg-[var(--sarthi-surface-low)] shadow-sm"
          >
            Method
          </button>
        </div>

        <div className="mt-5 grid grid-cols-12 gap-3 relative">
          {(images.length >= 3 ? images.slice(0, 3) : images).map((img, idx) => (
            <div
              key={img.src}
              className={`col-span-12 sm:col-span-4 rounded-3xl overflow-hidden border border-[var(--sarthi-outline-soft)] bg-white shadow-sm relative group ${
                idx === 1 ? 'sm:-translate-y-1' : ''
              }`}
              style={{ transform: idx === 1 ? 'translateY(-2px)' : undefined }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-80 pointer-events-none" />
              <img
                src={img.src}
                alt={img.alt || ''}
                className="w-full h-[140px] sm:h-[160px] object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-white/95 text-[var(--sarthi-on-background)] border border-[var(--sarthi-outline-soft)]">
                  Field proof
                </span>
                <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-black/40 text-white">
                  Curated
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[95] bg-black/50 p-4 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[var(--sarthi-outline-soft)] shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[var(--sarthi-primary)] opacity-10 blur-2xl" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-black text-xl sarthi-headline text-[var(--sarthi-primary)]">Method (pilot)</p>
                <p className="mt-1 text-xs text-[var(--sarthi-on-surface-variant)]">
                  What we used to design Sarthi v3.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[40px] px-4 rounded-2xl bg-[var(--sarthi-primary)] text-white font-extrabold shadow-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[var(--sarthi-on-surface-variant)] leading-relaxed relative">
              {[
                'Field conversations + market observation (APMC flows, trader workflows).',
                'Interviews captured in your tracker; we surface only aggregated insights in-app.',
                'Product focus: moisture/quality deductions, storage constraints, and WhatsApp-first ops.',
                'Privacy: no raw phone numbers, no precise lat/lng dumps, no PII in UI.',
              ].map((x) => (
                <div key={x} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[var(--sarthi-primary)] opacity-80" />
                  <p className="flex-1">{x}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-[var(--sarthi-on-surface-variant)] opacity-80">
              Replace the demo images with your field photos by adding files under <code className="font-mono">public/proof/</code> later.
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  );
};

