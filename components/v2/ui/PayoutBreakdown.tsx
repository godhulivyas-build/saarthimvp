import React from 'react';
import { Card } from './Card';

export type PayoutSplit = {
  farmer?: number;
  logistics?: number;
  platform?: number;
  total: number;
};

const fmt = (n: number) => `₹${Math.round(n)}`;

export const PayoutBreakdown: React.FC<{
  title?: string;
  split: PayoutSplit;
  note?: string;
}> = ({ title = 'Payout breakdown', split, note }) => {
  const rows: { label: string; value: number | undefined; strong?: boolean }[] = [
    { label: 'Farmer net', value: split.farmer },
    { label: 'Logistics payout', value: split.logistics },
    { label: 'Platform fee', value: split.platform },
    { label: 'Total', value: split.total, strong: true },
  ].filter((r) => typeof r.value === 'number');

  return (
    <Card className="p-4">
      <p className="font-extrabold saarthi-headline">{title}</p>
      <div className="mt-3 space-y-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <span className={r.strong ? 'font-extrabold' : 'text-[var(--saarthi-on-surface-variant)]'}>{r.label}</span>
            <span className={r.strong ? 'font-extrabold text-[var(--saarthi-primary)]' : 'font-bold'}>{fmt(r.value as number)}</span>
          </div>
        ))}
      </div>
      {note ? <p className="mt-3 text-xs text-[var(--saarthi-on-surface-variant)] opacity-80">{note}</p> : null}
    </Card>
  );
};

