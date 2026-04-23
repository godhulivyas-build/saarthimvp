export type MoistureRiskBand = 'low' | 'medium' | 'high';

export type MoistureImpact = {
  crop: string;
  moisturePct: number;
  band: MoistureRiskBand;
  impactPctRange: { low: number; high: number }; // negative means price deduction
  note: string;
};

// Pilot assumptions only (not a calibrated dataset).
const CROP_BASELINES: Record<
  string,
  { idealMax: number; warnMax: number; highMax: number; impactPerPct: number; maxImpact: number }
> = {
  Onion: { idealMax: 12, warnMax: 16, highMax: 22, impactPerPct: 1.2, maxImpact: 14 },
  Potato: { idealMax: 11, warnMax: 15, highMax: 21, impactPerPct: 1.1, maxImpact: 12 },
  Tomato: { idealMax: 8, warnMax: 12, highMax: 18, impactPerPct: 1.5, maxImpact: 16 },
  Wheat: { idealMax: 12, warnMax: 14, highMax: 18, impactPerPct: 1.0, maxImpact: 10 },
  Soybean: { idealMax: 12, warnMax: 14, highMax: 18, impactPerPct: 1.3, maxImpact: 14 },
};

export function computeMoistureImpact(crop: string, moisturePct: number): MoistureImpact {
  const m = clamp(moisturePct, 0, 40);
  const cfg = CROP_BASELINES[crop] ?? CROP_BASELINES.Soybean;

  let band: MoistureRiskBand = 'low';
  if (m > cfg.warnMax) band = 'medium';
  if (m > cfg.highMax) band = 'high';

  const over = Math.max(0, m - cfg.idealMax);
  const center = Math.min(cfg.maxImpact, over * cfg.impactPerPct);

  const spread = band === 'low' ? 1.5 : band === 'medium' ? 3.5 : 5.5;
  const low = -Math.max(0, Math.round((center - spread) * 10) / 10);
  const high = -Math.max(0, Math.round((center + spread) * 10) / 10);

  const note =
    band === 'low'
      ? 'Low risk (pilot)'
      : band === 'medium'
        ? 'Moisture risk: possible deductions (pilot)'
        : 'High moisture risk: grade/deduction likely (pilot)';

  return { crop, moisturePct: m, band, impactPctRange: { low, high }, note };
}

export function formatPctRange(r: { low: number; high: number }): string {
  if (r.low === 0 && r.high === 0) return '0%';
  const lo = `${r.low}%`;
  const hi = `${r.high}%`;
  return lo === hi ? lo : `${lo} to ${hi}`;
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

