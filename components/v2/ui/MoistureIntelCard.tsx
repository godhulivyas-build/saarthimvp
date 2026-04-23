import React from 'react';
import { Droplets, Info } from 'lucide-react';
import { Card } from './Card';
import { computeMoistureImpact } from '../../../services/moisturePriceModel';

const CROP_OPTS = ['Onion', 'Potato', 'Tomato', 'Soybean', 'Wheat'] as const;

export const MoistureIntelCard: React.FC<{
  title?: string;
  initialCrop?: string;
  initialMoisturePct?: number;
  compact?: boolean;
}> = ({ title = 'Moisture risk (pilot)', initialCrop = 'Onion', initialMoisturePct = 14, compact }) => {
  const [crop, setCrop] = React.useState(initialCrop);
  const [moisture, setMoisture] = React.useState(initialMoisturePct);

  const impact = React.useMemo(() => computeMoistureImpact(crop, moisture), [crop, moisture]);

  const bandStyle =
    impact.band === 'low'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : impact.band === 'medium'
        ? 'bg-amber-50 text-amber-900 border-amber-200'
        : 'bg-rose-50 text-rose-900 border-rose-200';

  return (
    <Card className={compact ? 'p-4' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-extrabold saarthi-headline flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[var(--saarthi-secondary)]" />
            {title}
          </p>
          <p className="text-xs text-[var(--saarthi-on-surface-variant)] mt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Assumptions based on interviews. Not a calibrated dataset yet.
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-full border ${bandStyle}`}>
          {impact.band.toUpperCase()}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-[var(--saarthi-on-surface-variant)]">Crop</label>
          <select
            className="mt-1 w-full min-h-[44px] rounded-xl border-2 border-[var(--saarthi-outline-soft)] px-2 bg-white"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          >
            {CROP_OPTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-[var(--saarthi-on-surface-variant)]">Moisture (%)</label>
          <input
            className="mt-1 w-full min-h-[44px] rounded-xl border-2 border-[var(--saarthi-outline-soft)] px-3 bg-white"
            type="number"
            min={0}
            max={40}
            step={0.5}
            value={moisture}
            onChange={(e) => setMoisture(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-[var(--saarthi-outline-soft)] bg-[var(--saarthi-surface-low)] p-3 text-sm">
        <p className="font-bold">Moisture risk band: <span className="text-[var(--saarthi-primary)]">{impact.band.toUpperCase()}</span></p>
        <p className="text-xs text-[var(--saarthi-on-surface-variant)] mt-1">
          We don’t show numeric deductions until we have a verified dataset. This is a guidance-only flag based on farmer interviews.
        </p>
      </div>
    </Card>
  );
};

