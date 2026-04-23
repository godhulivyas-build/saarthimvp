import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Copy = {
  title: string;
  subtitle: string;
  steps: Array<{
    k: Step;
    eyebrow: string;
    headline: string;
    body: string;
    primary?: string;
    secondary?: string;
  }>;
  ctaLine: string;
  ctaBtn: string;
};

const HI_COPY: Copy = {
  title: 'सारथी सेतु पूरे भारत को जोड़ता है',
  subtitle: 'खरीदार, किसान और ट्रांसपोर्ट एक साथ',
  steps: [
    {
      k: 0,
      eyebrow: 'स्टेप 1',
      headline: 'महाराष्ट्र खरीदार',
      body: '500 किलो गेहूं चाहिए',
      primary: 'मांग भेजें',
    },
    {
      k: 1,
      eyebrow: 'स्टेप 2',
      headline: 'स्मार्ट मैचिंग',
      body: 'सारथी सेतु किसान खोज रहा है...',
    },
    {
      k: 2,
      eyebrow: 'स्टेप 3',
      headline: 'मध्य प्रदेश किसान उपलब्ध',
      body: '500 किलो गेहूं • नमी 12% • तुरंत लोडिंग',
      primary: 'स्वीकार करें',
      secondary: 'बात करें',
    },
    { k: 3, eyebrow: 'स्टेप 4', headline: 'लॉजिस्टिक्स', body: 'नज़दीकी ट्रक उपलब्ध — एक चुनें' },
    {
      k: 4,
      eyebrow: 'स्टेप 5',
      headline: 'डिलीवरी रूट',
      body: 'MP → महाराष्ट्र • ट्रक चल रहा है',
    },
    { k: 5, eyebrow: 'स्टेप 6', headline: 'डिलीवरी', body: 'डिलीवरी पूर्ण • पुष्टि' },
    { k: 6, eyebrow: 'स्टेप 7', headline: 'भुगतान', body: '₹12,750 भुगतान सफल' },
  ],
  ctaLine: 'खरीदार ऑर्डर → किसान एक्सेप्ट → ट्रक बुक → डिलीवरी → बेहतर दाम',
  ctaBtn: 'अभी जुड़ें',
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useStepProgress(step: Step) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = clamp01((now - start) / 280);
      setP(easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);
  return p;
}

const WheatWindBg: React.FC = () => {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/bg_wheat_sunset_wide.png')] bg-cover bg-center opacity-[0.60] blur-[1.6px] scale-[1.05]" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(251,191,36,0.30),transparent_52%),radial-gradient(circle_at_26%_35%,rgba(34,197,94,0.18),transparent_52%),radial-gradient(circle_at_50%_88%,rgba(245,158,11,0.18),transparent_60%)]"
        animate={reduce ? undefined : { opacity: [0.62, 0.78, 0.62] }}
        transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Wheat wind shimmer (pure CSS) */}
      <motion.div
        className="absolute -inset-12 opacity-[0.25] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.45),transparent)]"
        animate={reduce ? undefined : { x: ['-30%', '30%'] }}
        transition={reduce ? undefined : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transform: 'skewX(-18deg)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/76 via-white/68 to-white/80" />
    </div>
  );
};

type MapNode = 'MH' | 'MP' | 'DL' | 'KA' | 'PB';
const NODES: Record<MapNode, { label: string; pos: THREE.Vector3 }> = {
  // A stylized layout approximating India geography (not a PNG map).
  DL: { label: 'दिल्ली', pos: new THREE.Vector3(0.12, 0.35, 0.12) },
  PB: { label: 'पंजाब', pos: new THREE.Vector3(0.02, 0.36, 0.10) },
  MP: { label: 'मध्य प्रदेश', pos: new THREE.Vector3(0.10, 0.18, 0.02) },
  MH: { label: 'महाराष्ट्र', pos: new THREE.Vector3(-0.05, 0.02, -0.06) },
  KA: { label: 'कर्नाटक', pos: new THREE.Vector3(-0.02, -0.12, -0.10) },
};

function buildRoute(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().lerp(b, 0.5);
  mid.x += (b.y - a.y) * 0.12;
  mid.y += 0.08;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const pts = curve.getPoints(80);
  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  return { curve, pts, geom };
}

const IndiaPlate: React.FC<{ step: Step; progress: number }> = ({ step, progress }) => {
  // A “custom map”: base plate + raised “state blocks” (premium 3D look).
  const group = React.useRef<THREE.Group>(null);
  const [routes] = React.useState(() => ({
    mhToMp: buildRoute(NODES.MH.pos, NODES.MP.pos),
    mpToMh: buildRoute(NODES.MP.pos, NODES.MH.pos),
  }));

  const dot = React.useRef<THREE.Mesh>(null);
  const truck = React.useRef<THREE.Group>(null);
  const routeT = React.useRef(0);

  useFrame((_s, dt) => {
    if (!group.current) return;

    // Subtle camera-ish breathing via map bob
    group.current.rotation.z = lerp(group.current.rotation.z, 0.06, 0.08);
    group.current.rotation.x = lerp(group.current.rotation.x, 0.62, 0.08);
    group.current.rotation.y = lerp(group.current.rotation.y, -0.15, 0.08);
    group.current.position.y = lerp(group.current.position.y, -0.02, 0.08);

    // Movers
    const showDot = step === 1;
    const showTruck = step >= 5;

    if (dot.current) dot.current.visible = showDot;
    if (truck.current) truck.current.visible = showTruck;

    if (showDot) {
      routeT.current = (routeT.current + dt * 0.45) % 1;
      const p = routes.mhToMp.curve.getPointAt(routeT.current);
      dot.current!.position.copy(p);
    }
    if (showTruck) {
      routeT.current = (routeT.current + dt * 0.22) % 1;
      const p = routes.mpToMh.curve.getPointAt(routeT.current);
      const p2 = routes.mpToMh.curve.getPointAt((routeT.current + 0.01) % 1);
      truck.current!.position.copy(p);
      truck.current!.lookAt(p2);
    }
  });

  const baseHeight = 0.06 * progress;
  const stateExtra = (node: MapNode) => {
    if (node === 'MH') return (step >= 0 ? 0.11 : 0.06) * progress;
    if (node === 'MP') return (step >= 1 ? 0.12 : 0.07) * progress;
    if (node === 'DL') return (step >= 0 ? 0.10 : 0.06) * progress;
    if (node === 'KA') return (step >= 0 ? 0.06 : 0.05) * progress;
    if (node === 'PB') return (step >= 0 ? 0.06 : 0.05) * progress;
    return 0.06 * progress;
  };

  const glow = (active: boolean) => (active ? 1.0 : 0.25);
  const activeMH = step >= 0;
  const activeMP = step >= 1;
  const activeDL = step >= 0;

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Base plate: stylized India silhouette (custom geometry via shape) */}
      <mesh position={[0, 0, -baseHeight / 2]}>
        <cylinderGeometry args={[0.62, 0.68, baseHeight, 6, 1, false]} />
        <meshStandardMaterial color="#ffffff" roughness={0.62} metalness={0.08} />
      </mesh>

      {/* Raised state blocks */}
      {(Object.keys(NODES) as MapNode[]).map((k) => {
        const pos = NODES[k].pos;
        const h = stateExtra(k);
        const isActive = k === 'MH' ? activeMH : k === 'MP' ? activeMP : k === 'DL' ? activeDL : step >= 0;
        const emiss = k === 'MH' ? glow(activeMH) : k === 'MP' ? glow(activeMP) : k === 'DL' ? glow(activeDL) : 0.18;
        const color = k === 'MH' ? '#FFF7ED' : k === 'MP' ? '#F0FDF4' : k === 'DL' ? '#ECFEFF' : '#ffffff';

        return (
          <group key={k} position={[pos.x, pos.y, h / 2]}>
            <mesh>
              <boxGeometry args={[0.22, 0.16, h]} />
              <meshStandardMaterial
                color={color}
                roughness={0.55}
                metalness={0.10}
                emissive={new THREE.Color('#16a34a')}
                emissiveIntensity={emiss * 0.35}
              />
            </mesh>
            <mesh position={[0, 0, h / 2 + 0.004]}>
              <boxGeometry args={[0.226, 0.166, 0.008]} />
              <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.06} />
            </mesh>
          </group>
        );
      })}

      {/* Route lines */}
      <line geometry={routes.mhToMp.geom}>
        <lineBasicMaterial color={step >= 1 ? '#16a34a' : '#94a3b8'} linewidth={2} />
      </line>
      <line geometry={routes.mpToMh.geom}>
        <lineBasicMaterial color={step >= 5 ? '#f59e0b' : '#94a3b8'} linewidth={2} />
      </line>

      {/* Notification dot */}
      <mesh ref={dot} position={[0, 0, 0.18]}>
        <sphereGeometry args={[0.028, 20, 20]} />
        <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={1.2} />
      </mesh>

      {/* Truck (simple low-poly) */}
      <group ref={truck} position={[0, 0, 0.2]}>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.10, 0.05, 0.04]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.15} />
        </mesh>
        <mesh position={[0.03, 0, 0.04]}>
          <boxGeometry args={[0.05, 0.05, 0.04]} />
          <meshStandardMaterial color="#FDE68A" roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[-0.03, -0.02, 0.0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.02, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.03, -0.02, 0.0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.02, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
    </group>
  );
};

export const HowItWorks3DDemo: React.FC<{ onCtaClick?: () => void; lang?: string }> = ({ onCtaClick, lang }) => {
  const reduce = useReducedMotion();
  const rootRef = React.useRef<HTMLElement | null>(null);
  const pinRef = React.useRef<HTMLDivElement | null>(null);
  const [step, setStep] = React.useState<Step>(0);
  const stepProg = useStepProgress(step);
  const [selectedCarrier, setSelectedCarrier] = React.useState<'rajesh' | 'mohan' | null>(null);

  const copy = HI_COPY; // For now, Hindi-first as requested.

  React.useEffect(() => {
    if (!rootRef.current || !pinRef.current) return;
    if (reduce) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current!,
        start: 'top top',
        end: '+=3400',
        scrub: 0.7,
        pin: pinRef.current!,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const idx = Math.round(p * 6) as Step;
          setStep(Math.min(6, Math.max(0, idx)) as Step);
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [reduce]);

  // Auto loop (non-scroll) fallback: when user doesn't scroll for a while, keep it alive.
  React.useEffect(() => {
    if (reduce) return;
    let last = performance.now();
    const onScroll = () => {
      last = performance.now();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const id = window.setInterval(() => {
      if (performance.now() - last < 2200) return;
      setStep((s) => (((s + 1) % 7) as Step));
    }, 2200);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearInterval(id);
    };
  }, [reduce]);

  const active = copy.steps.find((s) => s.k === step) ?? copy.steps[0];

  return (
    <section ref={rootRef as any} className="relative">
      <div ref={pinRef} className="relative min-h-[100svh] overflow-hidden">
        <WheatWindBg />

        {/* Top copy */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="saarthi-headline text-2xl sm:text-4xl font-black text-[var(--saarthi-on-background)]">
                {copy.title}
              </p>
              <p className="mt-2 text-base sm:text-lg font-bold text-[var(--saarthi-on-surface-variant)] max-w-3xl">
                {copy.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-3xl border border-white/55 bg-white/78 backdrop-blur-xl px-4 py-3 shadow-sm">
              <img
                src="/images/saarthi_setu_logo.png"
                alt="सारथी सेतु"
                className="w-11 h-11 rounded-2xl bg-white ring-1 ring-[var(--saarthi-outline-soft)] p-1"
              />
              <div>
                <p className="text-sm font-black text-[var(--saarthi-primary)]">सारथी सेतु</p>
                <p className="text-[11px] font-extrabold text-[var(--saarthi-on-surface-variant)]">लाइव प्रोडक्ट डेमो</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
            {/* 3D stage */}
            <div className="rounded-[2rem] border border-white/60 bg-white/55 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.14)] overflow-hidden">
              <div className="relative p-4 sm:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.12),transparent_55%),radial-gradient(circle_at_80%_24%,rgba(251,191,36,0.16),transparent_55%)]" />

                <div className="relative">
                  <div className="h-[380px] sm:h-[440px] lg:h-[520px] w-full">
                    <Canvas
                      camera={{ position: [0.35, -0.9, 1.45], fov: 45, near: 0.1, far: 20 }}
                      dpr={[1, 1.6]}
                      gl={{ antialias: true, alpha: true }}
                    >
                      <ambientLight intensity={0.55} />
                      <directionalLight position={[2, 2, 3]} intensity={1.1} color="#ffffff" />
                      <directionalLight position={[-2, -1, 2]} intensity={0.35} color="#fff7ed" />
                      <group position={[0, 0, 0]}>
                        <IndiaPlate step={step} progress={stepProg} />
                      </group>
                      <Environment preset="sunset" />
                    </Canvas>
                  </div>

                  {/* Scene overlays anchored to the 3D map (feels like a live product) */}
                  <div className="pointer-events-none absolute inset-0">
                    {/* Scene 1: Buyer demand (Maharashtra) */}
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                      animate={reduce ? undefined : { opacity: step === 0 ? 1 : 0, y: step === 0 ? 0 : 10, scale: step === 0 ? 1 : 0.98 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute left-6 bottom-8 w-[min(340px,86%)]"
                    >
                      <div className="rounded-3xl border border-white/60 bg-white/86 backdrop-blur-xl shadow-sm px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl border border-white/70 bg-white grid place-items-center text-xl">👨‍💼</div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-[var(--saarthi-on-background)]">महाराष्ट्र खरीदार</p>
                            <p className="mt-1 text-lg font-black text-[var(--saarthi-primary)]">500 किलो गेहूं चाहिए</p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <div className="min-h-[42px] px-4 rounded-2xl bg-[var(--saarthi-primary)] text-white font-black grid place-items-center">
                            मांग भेजें
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Scene 2: Smart matching */}
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: -8 }}
                      animate={reduce ? undefined : { opacity: step === 1 ? 1 : 0, y: step === 1 ? 0 : -8 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute top-5 left-1/2 -translate-x-1/2 w-[min(520px,92%)]"
                    >
                      <div className="rounded-3xl border border-white/60 bg-white/82 backdrop-blur-xl shadow-sm px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-[var(--saarthi-on-background)]">सारथी सेतु किसान खोज रहा है...</p>
                          <motion.span
                            aria-hidden
                            className="w-2.5 h-2.5 rounded-full bg-[var(--saarthi-primary)]"
                            animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
                            transition={reduce ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Scene 3: Farmer response (MP) */}
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                      animate={reduce ? undefined : { opacity: step === 2 ? 1 : 0, y: step === 2 ? 0 : 10, scale: step === 2 ? 1 : 0.98 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute right-6 top-16 w-[min(360px,86%)]"
                    >
                      <div className="rounded-3xl border border-white/60 bg-white/86 backdrop-blur-xl shadow-sm px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl border border-white/70 bg-white grid place-items-center text-xl">🧑‍🌾</div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-[var(--saarthi-on-background)]">मध्य प्रदेश किसान उपलब्ध</p>
                            <p className="mt-1 text-base font-black text-[var(--saarthi-primary)]">500 किलो गेहूं</p>
                            <p className="mt-1 text-xs font-bold text-[var(--saarthi-on-surface-variant)]">नमी 12% • तुरंत लोडिंग</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2 justify-end">
                          <div className="min-h-[40px] px-4 rounded-2xl bg-[var(--saarthi-primary)] text-white font-black grid place-items-center">
                            स्वीकार करें
                          </div>
                          <div className="min-h-[40px] px-4 rounded-2xl bg-white/70 border border-white/70 text-[var(--saarthi-on-surface-variant)] font-black grid place-items-center">
                            बात करें
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Scene 4: Logistics carriers */}
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={reduce ? undefined : { opacity: step === 3 ? 1 : 0, y: step === 3 ? 0 : 10 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute left-6 top-20 w-[min(420px,92%)] pointer-events-auto"
                    >
                      <div className="rounded-3xl border border-white/60 bg-white/86 backdrop-blur-xl shadow-sm px-4 py-4">
                        <p className="text-sm font-black text-[var(--saarthi-on-background)]">नज़दीकी ट्रक उपलब्ध</p>
                        <div className="mt-3 grid gap-2">
                          {[
                            { id: 'rajesh' as const, name: 'राजेश ट्रांसपोर्ट', km: '5 km' },
                            { id: 'mohan' as const, name: 'मोहन लॉजिस्टिक्स', km: '8 km' },
                          ].map((c) => {
                            const sel = selectedCarrier === c.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedCarrier(c.id)}
                                className={`w-full text-left rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 ${
                                  sel ? 'border-[var(--saarthi-primary)] bg-green-50' : 'border-white/70 bg-white/80'
                                }`}
                              >
                                <span className="text-sm font-black text-[var(--saarthi-on-background)]">{c.name}</span>
                                <span className="text-xs font-black text-[var(--saarthi-primary)]">{c.km}</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs font-bold text-[var(--saarthi-on-surface-variant)]">किसान एक ट्रक चुनता है • फिर ट्रक रवाना</p>
                      </div>
                    </motion.div>

                    {/* Scene 6: Payment */}
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                      animate={reduce ? undefined : { opacity: step === 6 ? 1 : 0, y: step === 6 ? 0 : 10, scale: step === 6 ? 1 : 0.98 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute right-6 bottom-10 w-[min(320px,86%)]"
                    >
                      <div className="rounded-3xl border border-white/60 bg-white/86 backdrop-blur-xl shadow-sm px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-[var(--saarthi-on-background)]">भुगतान</p>
                            <p className="mt-1 text-lg font-black text-[var(--saarthi-primary)]">₹12,750 भुगतान सफल</p>
                          </div>
                          <div className="w-12 h-12 rounded-2xl border border-white/70 bg-white grid place-items-center text-xl">✅</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Legend (minimal, 5-second comprehension) */}
                  <div className="mt-4 rounded-3xl border border-white/60 bg-white/78 backdrop-blur px-4 py-3 shadow-sm">
                    <p className="text-xs sm:text-sm font-extrabold text-[var(--saarthi-on-surface-variant)]">
                      {copy.ctaLine}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live demo cards */}
            <div className="space-y-4">
              <motion.div
                key={active.k}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="rounded-[2rem] border border-white/60 bg-white/82 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.14)] p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-[11px] font-extrabold text-[var(--saarthi-on-surface-variant)]">{active.eyebrow}</p>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-[var(--saarthi-on-background)] leading-tight">
                      {active.headline}
                    </p>
                    <p className="mt-2 text-base sm:text-lg font-bold text-[var(--saarthi-primary)]">{active.body}</p>
                  </div>
                  <div className="w-12 h-12 rounded-3xl grid place-items-center bg-[rgba(34,197,94,0.12)] border border-white/60 text-xl font-black text-[var(--saarthi-primary)]">
                    {step === 0 ? '📍' : step === 1 ? '🔔' : step === 2 ? '🧑‍🌾' : step === 3 ? '🤝' : step === 4 ? '🚚' : step === 5 ? '🛣️' : '₹'}
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  {active.primary ? (
                    <button
                      type="button"
                      className="min-h-[54px] px-6 rounded-2xl bg-[var(--saarthi-primary)] text-white font-black shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
                    >
                      {active.primary}
                    </button>
                  ) : null}
                  {active.secondary ? (
                    <button
                      type="button"
                      className="min-h-[54px] px-6 rounded-2xl bg-white/70 border border-white/70 text-[var(--saarthi-on-surface-variant)] font-black"
                    >
                      {active.secondary}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onCtaClick}
                    className="min-h-[54px] px-6 rounded-2xl bg-white/70 border border-white/70 text-[var(--saarthi-primary)] font-black"
                  >
                    {copy.ctaBtn}
                  </button>
                </div>
              </motion.div>

              <div className="rounded-[2rem] border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm p-5 sm:p-6">
                <p className="text-sm font-black text-[var(--saarthi-on-background)]">स्क्रोल करें</p>
                <p className="mt-1 text-xs sm:text-sm font-bold text-[var(--saarthi-on-surface-variant)]">
                  हर स्क्रोल पर स्टोरी आगे बढ़ेगी — और ऑटो-लूप भी चलेगा।
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {copy.steps.map((s) => (
                    <span
                      key={s.k}
                      className={`h-2.5 w-2.5 rounded-full border ${
                        step === s.k ? 'bg-[var(--saarthi-primary)] border-[var(--saarthi-primary)]' : 'bg-white/70 border-white/70'
                      }`}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* End CTA */}
          <div className="mt-6 rounded-[2rem] border border-white/60 bg-white/78 backdrop-blur-xl shadow-sm px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm sm:text-base font-black text-[var(--saarthi-on-background)]">
              सीधा सौदा • सही दाम • भरोसेमंद डिलीवरी
            </p>
            <button
              type="button"
              onClick={onCtaClick}
              className="min-h-[50px] px-6 rounded-2xl bg-[var(--saarthi-primary)] text-white font-black shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            >
              {copy.ctaBtn}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

