import React from 'react';
import { AgriPlatformShell } from './AgriPlatformShell';
import { Card } from '../v2/ui/Card';
import { diagnoseCropFromImage, type CropDiagnosisResult } from '../../services/cropDiagnosisService';
import { ProofStrip } from '../landing/ProofStrip';
import { PROOF_IMAGES } from '../landing/proofAssets';
import { SaarthiEcosystemVisual } from '../landing/visuals/SaarthiEcosystemVisual';
import { SaarthiWorkflowVisual } from '../landing/visuals/SaarthiWorkflowVisual';

const Section: React.FC<{ id: string; title: string; subtitle: string; children: React.ReactNode }> = ({
  id,
  title,
  subtitle,
  children,
}) => (
  <section id={id} className="scroll-mt-28 py-10">
    <div className="mb-5">
      <h2 className="saarthi-headline text-2xl sm:text-3xl font-extrabold text-[var(--saarthi-on-background)]">{title}</h2>
      <p className="mt-1 text-sm sm:text-base text-[var(--saarthi-on-surface-variant)] max-w-3xl">{subtitle}</p>
    </div>
    {children}
  </section>
);

const CropMap: React.FC = () => {
  const [crop, setCrop] = React.useState<'Soybean' | 'Wheat' | 'Onion' | 'Cotton'>('Soybean');
  const states = [
    { s: 'MP', v: 78 },
    { s: 'MH', v: 65 },
    { s: 'RJ', v: 52 },
    { s: 'UP', v: 70 },
    { s: 'GJ', v: 55 },
    { s: 'KA', v: 48 },
    { s: 'TG', v: 44 },
    { s: 'PB', v: 60 },
  ];
  const color = (v: number) => `rgba(13, 99, 27, ${0.12 + (v / 100) * 0.55})`;

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <Card className="p-5 sm:p-6 overflow-hidden relative">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">Crop intensity</p>
            <p className="font-extrabold text-[var(--saarthi-primary)]">{crop}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['Soybean', 'Wheat', 'Onion', 'Cotton'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCrop(c)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors ${
                  crop === c
                    ? 'bg-[var(--saarthi-primary)] text-white border-[var(--saarthi-primary)]'
                    : 'bg-white border-[var(--saarthi-outline-soft)] text-[var(--saarthi-on-surface-variant)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {states.map((x) => (
            <div
              key={x.s}
              className="rounded-2xl p-3 border border-[var(--saarthi-outline-soft)] relative overflow-hidden"
              style={{ background: color(x.v) }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold">{x.s}</span>
                <span className="text-xs font-bold text-[var(--saarthi-on-surface-variant)]">{x.v}%</span>
              </div>
              <div
                className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.35)',
                  animation: 'scaleIn 1.4s ease-out both',
                }}
              />
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-[var(--saarthi-on-surface-variant)] opacity-80">
          Visual demo map (sample intensity). Later: swap in a real India choropleth + district data feed.
        </p>
      </Card>

      <Card className="p-5 sm:p-6">
        <p className="font-extrabold text-[var(--saarthi-on-background)]">Why this matters</p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--saarthi-on-surface-variant)]">
          <li>- Early signals for price movement and demand spikes.</li>
          <li>- Helps route cold-chain capacity and empty-truck backhauls.</li>
          <li>- Guides advisories and input supply planning.</li>
        </ul>
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {[
            { k: 'Signal', v: 'Crop spread + arrivals + weather' },
            { k: 'Output', v: 'Booking demand + mandi watchlist' },
            { k: 'Users', v: 'Farmers, buyers, logistics, storage' },
            { k: 'Latency', v: 'Near-real-time updates' },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl border border-[var(--saarthi-outline-soft)] bg-white p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">{x.k}</p>
              <p className="mt-1 font-bold text-sm">{x.v}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const EcosystemNetwork: React.FC = () => (
  <Card className="p-5 sm:p-6 overflow-hidden">
    <div className="grid lg:grid-cols-2 gap-6 items-center">
      <div>
        <p className="font-extrabold text-[var(--saarthi-on-background)]">Saarthi ecosystem graph</p>
        <p className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)]">
          A simple network view of how value moves: trust, data, and logistics capacity.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--saarthi-on-surface-variant)]">
          <li>- Farmers publish supply + pickup windows.</li>
          <li>- Buyers post demand + quality needs.</li>
          <li>- Logistics matches forward + backhaul.</li>
          <li>- Storage stabilizes price and reduces spoilage.</li>
          <li>- Manufacturing enables local repair + input supply.</li>
        </ul>
      </div>

      <div className="relative">
        <svg viewBox="0 0 520 320" className="w-full h-auto">
          <defs>
            <radialGradient id="g" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(13,99,27,0.28)" />
              <stop offset="100%" stopColor="rgba(13,99,27,0.05)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="520" height="320" rx="24" fill="url(#g)" />

          {[
            ['Farmers', 90, 160],
            ['Buyers', 420, 120],
            ['Logistics', 420, 220],
            ['Storage', 260, 60],
            ['Manufacturing', 260, 260],
            ['Saarthi', 260, 160],
          ].map(([label, x, y]) => (
            <g key={String(label)}>
              <line x1="260" y1="160" x2={Number(x)} y2={Number(y)} stroke="rgba(64,73,61,0.35)" strokeWidth="2" />
              <circle cx={Number(x)} cy={Number(y)} r="22" fill="white" stroke="rgba(112,122,108,0.25)" strokeWidth="2" />
              <text x={Number(x)} y={Number(y) + 5} textAnchor="middle" fontSize="11" fontWeight="800" fill="#181d17">
                {label}
              </text>
            </g>
          ))}

          <circle cx="260" cy="160" r="28" fill="#0d631b" opacity="0.95" />
          <text x="260" y="166" textAnchor="middle" fontSize="12" fontWeight="900" fill="white">
            Saarthi
          </text>
        </svg>
      </div>
    </div>
  </Card>
);

const NoEmptyTruck: React.FC = () => (
  <div className="grid lg:grid-cols-3 gap-6">
    <Card className="p-5 sm:p-6 lg:col-span-1">
      <p className="font-extrabold">The problem</p>
      <p className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)]">
        Trucks return empty after delivery. That increases cost for farmers and reduces earnings for logistics partners.
      </p>
      <div className="mt-4 rounded-2xl bg-[var(--saarthi-surface-low)] border border-[var(--saarthi-outline-soft)] p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">Optimization goal</p>
        <p className="mt-1 font-black text-2xl text-[var(--saarthi-primary)]">+18–25%</p>
        <p className="text-xs text-[var(--saarthi-on-surface-variant)]">higher utilization (pilot target)</p>
      </div>
    </Card>

    <Card className="p-5 sm:p-6 lg:col-span-2">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="font-extrabold text-sm">Forward loads</p>
          <div className="mt-2 space-y-2">
            {[
              { r: 'Indore → Bhopal', c: 'Vegetables', w: '1.2T' },
              { r: 'Ujjain → Indore', c: 'Soybean', w: '3.0T' },
              { r: 'Ratlam → Neemuch', c: 'Onion', w: '2.0T' },
            ].map((x) => (
              <div key={x.r} className="rounded-2xl bg-white border border-[var(--saarthi-outline-soft)] p-4">
                <p className="font-extrabold">{x.r}</p>
                <p className="text-xs text-[var(--saarthi-on-surface-variant)] mt-1">
                  {x.c} · {x.w}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-extrabold text-sm">Backhaul matches</p>
          <div className="mt-2 space-y-2">
            {[
              { r: 'Bhopal → Indore', c: 'Packaging material', w: '0.8T', tag: 'Matched' },
              { r: 'Indore → Ujjain', c: 'Fertilizer', w: '1.5T', tag: 'Suggested' },
              { r: 'Neemuch → Ratlam', c: 'Spare parts', w: '0.4T', tag: 'Matched' },
            ].map((x) => (
              <div key={x.r} className="rounded-2xl bg-[var(--saarthi-surface)] border border-[var(--saarthi-outline-soft)] p-4 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{x.r}</p>
                    <p className="text-xs text-[var(--saarthi-on-surface-variant)] mt-1">
                      {x.c} · {x.w}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-[var(--saarthi-primary)] text-white">
                    {x.tag}
                  </span>
                </div>
                <div className="absolute -right-12 -top-12 w-28 h-28 rounded-full bg-[var(--saarthi-primary)] opacity-10 anim-scale" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--saarthi-on-surface-variant)] opacity-80">
        Matching logic is demo now; later we’ll connect it to live demand + carrier capacity signals.
      </p>
    </Card>
  </div>
);

const WomenPilot: React.FC = () => (
  <Card className="p-5 sm:p-6">
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <p className="font-extrabold text-lg">Women farmer literacy pilot</p>
        <p className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)] max-w-2xl">
          A guided program that uses voice-first UX, WhatsApp nudges, and local language micro-lessons to improve adoption and outcomes.
        </p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[
            { k: 'Modules', v: '8 voice lessons' },
            { k: 'Duration', v: '4 weeks' },
            { k: 'Goal', v: 'Booking + price confidence' },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl border border-[var(--saarthi-outline-soft)] bg-white p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">{x.k}</p>
              <p className="mt-1 font-extrabold">{x.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-[var(--saarthi-outline-soft)] bg-[var(--saarthi-surface-low)] p-4">
          <p className="text-sm font-extrabold">Pilot outcomes we track</p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--saarthi-on-surface-variant)]">
            <li>- Voice onboarding completion</li>
            <li>- Successful booking rate</li>
            <li>- Higher realized price vs baseline</li>
            <li>- Reduced dependence on intermediaries</li>
          </ul>
        </div>
      </div>
      <div className="rounded-3xl bg-[var(--saarthi-primary)] text-white p-6">
        <p className="font-black text-2xl">Enroll</p>
        <p className="mt-2 text-sm text-white/90">
          Start with a local FPO/SHG cluster. Sessions can be run by a field coordinator.
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-2xl bg-white text-[var(--saarthi-primary)] font-extrabold py-3 active:scale-[0.99] transition-transform"
        >
          Request pilot onboarding
        </button>
        <p className="mt-3 text-xs text-white/80">Sample CTA (no backend yet).</p>
      </div>
    </div>
  </Card>
);

const CropDiagnosis: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<CropDiagnosisResult | null>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await diagnoseCropFromImage(file);
      setResult(r);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-5 sm:p-6">
        <p className="font-extrabold">Upload a crop photo</p>
        <p className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)]">
          Demo experience. If `VITE_GEMINI_API_KEY` is set, it uses Gemini; otherwise it returns a deterministic sample.
        </p>
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
        </div>
        <button
          type="button"
          onClick={run}
          disabled={!file || busy}
          className="mt-4 w-full rounded-2xl bg-[var(--saarthi-primary)] text-white font-extrabold py-3 disabled:opacity-50"
        >
          {busy ? 'Analyzing…' : 'Diagnose'}
        </button>
      </Card>

      <Card className="p-5 sm:p-6">
        <p className="font-extrabold">Result</p>
        {!result ? (
          <p className="mt-3 text-sm text-[var(--saarthi-on-surface-variant)]">No diagnosis yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-[var(--saarthi-outline-soft)] bg-white p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">Likely issue</p>
              <p className="mt-1 text-lg font-black text-[var(--saarthi-primary)]">{result.label}</p>
              <p className="text-xs text-[var(--saarthi-on-surface-variant)] mt-1">
                Confidence: {Math.round(result.confidence * 100)}%
              </p>
            </div>
            <p className="text-sm text-[var(--saarthi-on-surface-variant)] leading-relaxed">{result.summary}</p>
            <div className="rounded-2xl bg-[var(--saarthi-surface-low)] border border-[var(--saarthi-outline-soft)] p-4">
              <p className="text-sm font-extrabold">Next actions</p>
              <ul className="mt-2 space-y-2 text-sm text-[var(--saarthi-on-surface-variant)]">
                {result.actions.map((a) => (
                  <li key={a}>- {a}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-[var(--saarthi-on-surface-variant)] opacity-80">{result.disclaimer}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

const SoilIot: React.FC = () => (
  <div className="grid lg:grid-cols-3 gap-6">
    <Card className="p-5 sm:p-6 lg:col-span-2">
      <p className="font-extrabold">Sensor tiles</p>
      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        {[
          { k: 'Moisture', v: '24%', tag: 'Low', c: 'text-orange-700' },
          { k: 'Soil pH', v: '6.8', tag: 'Normal', c: 'text-green-700' },
          { k: 'Temp', v: '31°C', tag: 'High', c: 'text-orange-700' },
          { k: 'EC', v: '1.2', tag: 'Normal', c: 'text-green-700' },
          { k: 'Rain', v: '2mm', tag: 'Light', c: 'text-sky-700' },
          { k: 'Alert', v: 'Irrigate', tag: 'Action', c: 'text-red-700' },
        ].map((x) => (
          <div key={x.k} className="rounded-2xl border border-[var(--saarthi-outline-soft)] bg-white p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">{x.k}</p>
            <p className="mt-1 text-2xl font-black text-[var(--saarthi-on-background)]">{x.v}</p>
            <p className={`text-xs font-extrabold mt-1 ${x.c}`}>{x.tag}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--saarthi-on-surface-variant)] opacity-80">
        Sample readings only. Later: ingest from IoT gateway and trigger WhatsApp alerts.
      </p>
    </Card>
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <p className="font-extrabold">Automations</p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--saarthi-on-surface-variant)]">
          <li>- Moisture low → irrigation reminder</li>
          <li>- Temperature excursion → cold-chain alert</li>
          <li>- pH drift → advisory for next cycle</li>
        </ul>
      </Card>
      <Card className="p-5 sm:p-6">
        <p className="font-extrabold">Data privacy</p>
        <p className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)]">
          Farmers control sharing. Aggregated insights are used for matching and forecasting.
        </p>
      </Card>
    </div>
  </div>
);

const Traceability: React.FC = () => (
  <Card className="p-5 sm:p-6">
    <p className="font-extrabold">Food-to-home flow</p>
    <div className="mt-4 grid md:grid-cols-7 gap-3 items-stretch">
      {[
        { t: 'Farm', d: 'Harvest + quality check' },
        { t: 'Aggregation', d: 'Lot creation + grading' },
        { t: 'Cold storage', d: 'Temperature logs' },
        { t: 'Transport', d: 'GPS + handoffs' },
        { t: 'Buyer', d: 'Acceptance + payment' },
        { t: 'Retail', d: 'Batch to shelf' },
        { t: 'Home', d: 'QR verification' },
      ].map((x, i) => (
        <div key={x.t} className="rounded-2xl border border-[var(--saarthi-outline-soft)] bg-white p-4 relative overflow-hidden">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">
            Step {i + 1}
          </p>
          <p className="mt-1 font-black text-[var(--saarthi-on-background)]">{x.t}</p>
          <p className="mt-1 text-xs text-[var(--saarthi-on-surface-variant)]">{x.d}</p>
          <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-[var(--saarthi-primary)] opacity-10" />
        </div>
      ))}
    </div>
    <p className="mt-4 text-xs text-[var(--saarthi-on-surface-variant)] opacity-80">
      Designed as a product surface first; later it can be backed by batch IDs + event logs.
    </p>
  </Card>
);

const Manufacturing: React.FC = () => (
  <div className="grid lg:grid-cols-3 gap-6">
    <Card className="p-5 sm:p-6 lg:col-span-2">
      <p className="font-extrabold">Local manufacturing ecosystem</p>
      <p className="mt-2 text-sm text-[var(--saarthi-on-surface-variant)]">
        Directory + lead routing for repair, packaging, solar pumps, and cold-chain components.
      </p>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {[
          { n: 'PackPro Indore', c: 'Crates + corrugation', s: '2-day delivery' },
          { n: 'ColdChain Works', c: 'Insulation panels', s: 'On-site install' },
          { n: 'SolarPump MP', c: 'Pump + service', s: 'AMC available' },
          { n: 'AgriSensors Lab', c: 'Soil probes', s: 'Bulk discounts' },
        ].map((x) => (
          <div key={x.n} className="rounded-2xl border border-[var(--saarthi-outline-soft)] bg-white p-4">
            <p className="font-extrabold">{x.n}</p>
            <p className="text-xs text-[var(--saarthi-on-surface-variant)] mt-1">{x.c}</p>
            <p className="text-xs font-extrabold text-[var(--saarthi-primary)] mt-2">{x.s}</p>
          </div>
        ))}
      </div>
    </Card>
    <Card className="p-5 sm:p-6">
      <p className="font-extrabold">Request a quote</p>
      <div className="mt-3 space-y-2">
        <input className="saarthi-input" placeholder="Category (e.g. crates)" />
        <input className="saarthi-input" placeholder="Location" />
        <input className="saarthi-input" placeholder="Quantity / budget" />
      </div>
      <button type="button" className="mt-4 w-full rounded-2xl bg-[var(--saarthi-primary)] text-white font-extrabold py-3">
        Submit request
      </button>
      <p className="mt-3 text-xs text-[var(--saarthi-on-surface-variant)] opacity-80">Sample form (no backend yet).</p>
    </Card>
  </div>
);

export const AgriPlatformPage: React.FC = () => {
  return (
    <AgriPlatformShell title="Startup-grade agritech platform">
      <div className="space-y-10 pb-24 lg:pb-0">
        <div className="py-8">
          <h1 className="saarthi-headline text-3xl sm:text-4xl md:text-5xl font-black text-[var(--saarthi-primary)] leading-tight">
            Saarthi Platform
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--saarthi-on-surface-variant)] max-w-3xl">
            A clean, voice-first, multi-role agritech suite: market intelligence, logistics optimization, crop health, monitoring, and end-to-end
            traceability.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              { k: 'North star', v: 'Less waste, more farmer income' },
              { k: 'UX', v: 'Voice-first + WhatsApp-first' },
              { k: 'Trust', v: 'Traceability + verified network' },
            ].map((x) => (
              <Card key={x.k} className="p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--saarthi-on-surface-variant)]">{x.k}</p>
                <p className="mt-1 font-extrabold text-[var(--saarthi-on-background)]">{x.v}</p>
              </Card>
            ))}
          </div>
        </div>

        <ProofStrip
          images={PROOF_IMAGES}
          headline="Built with farmers (proof)"
        />

        <Section
          id="workflow"
          title="Saarthi workflow (localized)"
          subtitle="A clean, language-switchable view of the end-to-end farmer journey Saarthi supports."
        >
          <div className="space-y-6">
            <SaarthiWorkflowVisual highlightStep={2} />
            <SaarthiEcosystemVisual />
          </div>
        </Section>

        <Section
          id="map"
          title="Animated India crop map"
          subtitle="A fast, visual way to understand what’s growing where—and how it impacts prices, bookings, and cold-chain demand."
        >
          <CropMap />
        </Section>

        <Section
          id="network"
          title="Saarthi ecosystem network graphic"
          subtitle="A single view of the ecosystem connections: trust, demand, supply, capacity, and service providers."
        >
          <EcosystemNetwork />
        </Section>

        <Section
          id="optimization"
          title="No empty truck optimization"
          subtitle="Backhaul matching to reduce empty returns—lower cost for farmers and clearer earnings for logistics partners."
        >
          <NoEmptyTruck />
        </Section>

        <Section
          id="women"
          title="Women farmer literacy pilot"
          subtitle="Voice-first onboarding + micro-lessons + nudges to improve confidence, adoption, and outcomes."
        >
          <WomenPilot />
        </Section>

        <Section
          id="diagnosis"
          title="Crop photo AI diagnosis"
          subtitle="Upload a crop photo for a quick diagnosis and next steps. (Demo now; can be backed by Gemini when configured.)"
        >
          <CropDiagnosis />
        </Section>

        <Section
          id="iot"
          title="Soil + IoT monitoring"
          subtitle="Sensor tiles, alerts, and simple automations—designed to be operationally useful, not overwhelming."
        >
          <SoilIot />
        </Section>

        <Section
          id="trace"
          title="Traceability: food-to-home"
          subtitle="A timeline that makes trust visible: lot creation, temperature logs, handoffs, and QR verification."
        >
          <Traceability />
        </Section>

        <Section
          id="manufacturing"
          title="Local manufacturing ecosystem"
          subtitle="Directory + lead routing for the local suppliers that keep agriculture running: repair, packaging, sensors, and cold-chain parts."
        >
          <Manufacturing />
        </Section>
      </div>
    </AgriPlatformShell>
  );
};

