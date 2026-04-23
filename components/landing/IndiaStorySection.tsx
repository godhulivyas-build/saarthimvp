import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Slide = 0 | 1 | 2 | 3;

export const IndiaStorySection: React.FC<{ onCtaClick?: () => void }> = ({ onCtaClick }) => {
  const reduce = useReducedMotion();
  const rootRef = React.useRef<HTMLElement | null>(null);
  const pinRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const logoRef = React.useRef<HTMLDivElement | null>(null);

  const routeDLtoMPRef = React.useRef<SVGPathElement | null>(null);
  const routeMPtoMHRef = React.useRef<SVGPathElement | null>(null);
  const dotRef = React.useRef<SVGCircleElement | null>(null);
  const truckRef = React.useRef<SVGGElement | null>(null);

  const [slide, setSlide] = React.useState<Slide>(0);

  const SLIDES = React.useMemo(
    () => [
      {
        k: 0,
        title: 'दिल्ली से डिमांड उठती है',
        big: '“मुझे 500 किलो गेहूं चाहिए”',
        meta: 'खरीदार • दिल्ली',
        icon: '📍',
      },
      {
        k: 1,
        title: 'नोटिफिकेशन MP किसान तक जाता है',
        big: '“नया ऑर्डर प्राप्त हुआ”',
        meta: 'अलर्ट • मध्य प्रदेश',
        icon: '🔔',
      },
      {
        k: 2,
        title: 'सारथी सेतु ट्रांसपोर्ट बुक करता है',
        big: '“ट्रक MP → महाराष्ट्र”',
        meta: 'लॉजिस्टिक्स • ऑटो-बुक',
        icon: '🚛',
      },
      {
        k: 3,
        title: 'डिलीवरी पूर्ण • भुगतान मिल गया',
        big: '₹12,750 भुगतान प्राप्त हुआ',
        meta: 'सफल • बेहतर दाम',
        icon: '₹',
      },
    ],
    []
  );

  React.useEffect(() => {
    if (!rootRef.current || !pinRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      // Reset
      gsap.set(trackRef.current, { xPercent: 0 });

      // Map rise (premium)
      gsap.set(logoRef.current, { opacity: 0, y: -10 });
      gsap.set(mapRef.current, {
        opacity: 0,
        y: 44,
        rotateX: 64,
        transformPerspective: 900,
        transformOrigin: '50% 85%',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: rootRef.current!,
          start: 'top top',
          end: `+=${SLIDES.length * 900}`,
          scrub: 0.8,
          pin: pinRef.current!,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (SLIDES.length - 1)) as Slide;
            setSlide(idx);
          },
        },
      });

      tl.to(logoRef.current, { opacity: 1, y: 0, duration: 0.25 }, 0.02);
      tl.to(mapRef.current, { opacity: 1, y: 0, rotateX: 0, duration: 0.7 }, 0.05);

      // Horizontal slides
      tl.to(trackRef.current, { xPercent: -100 * (SLIDES.length - 1), duration: 1 }, 0.15);
    }, rootRef);

    return () => ctx.revert();
  }, [SLIDES.length]);

  // Animate route + movers based on active slide (clean, not cluttered)
  React.useEffect(() => {
    if (reduce) return;
    if (!routeDLtoMPRef.current || !routeMPtoMHRef.current || !dotRef.current || !truckRef.current) return;

    const p1 = routeDLtoMPRef.current;
    const p2 = routeMPtoMHRef.current;
    const len1 = p1.getTotalLength();
    const len2 = p2.getTotalLength();

    const prep = (p: SVGPathElement) => {
      p.style.strokeDasharray = `${p.getTotalLength()}`;
      p.style.strokeDashoffset = `${p.getTotalLength()}`;
    };
    prep(p1);
    prep(p2);

    gsap.killTweensOf([p1, p2, dotRef.current, truckRef.current]);
    gsap.set(p1, { opacity: slide >= 1 ? 1 : 0.0, strokeDashoffset: slide >= 1 ? 0 : len1 });
    gsap.set(p2, { opacity: slide >= 2 ? 1 : 0.0, strokeDashoffset: slide >= 2 ? 0 : len2 });
    gsap.set(dotRef.current, { opacity: slide === 1 ? 1 : 0 });
    gsap.set(truckRef.current, { opacity: slide >= 2 ? 1 : 0, scale: slide >= 2 ? 1 : 0.95 });

    // simple looping movers only on relevant slide
    if (slide === 1) {
      const t0 = { v: 0 };
      gsap.to(t0, {
        v: 1,
        duration: 1.8,
        repeat: -1,
        ease: 'none',
        onUpdate: () => {
          const pt = p1.getPointAtLength(len1 * t0.v);
          dotRef.current!.setAttribute('cx', `${pt.x}`);
          dotRef.current!.setAttribute('cy', `${pt.y}`);
        },
      });
    }
    if (slide >= 2) {
      const t1 = { v: 0 };
      gsap.to(t1, {
        v: 1,
        duration: 2.4,
        repeat: -1,
        ease: 'none',
        onUpdate: () => {
          const pt = p2.getPointAtLength(len2 * t1.v);
          truckRef.current!.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        },
      });
    }
  }, [slide, reduce]);

  const Glass: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div
      className={[
        'rounded-[2rem] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.14)]',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </div>
  );

  return (
    <section ref={rootRef as any} className="relative">
      <div ref={pinRef} className="relative min-h-[100svh] overflow-hidden">
        {/* Background */}
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/bg_wheat_sunset_wide.png')] bg-cover bg-center opacity-[0.55] blur-[1.4px] scale-[1.04]" />
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(251,191,36,0.30),transparent_52%),radial-gradient(circle_at_26%_35%,rgba(34,197,94,0.18),transparent_52%),radial-gradient(circle_at_50%_88%,rgba(245,158,11,0.18),transparent_60%)]"
            animate={reduce ? undefined : { opacity: [0.62, 0.78, 0.62] }}
            transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/78 via-white/70 to-white/82" />
        </div>

        {/* Title row */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="saarthi-headline text-2xl sm:text-4xl font-black text-[var(--saarthi-on-background)]">
                सारथी सेतु पूरे भारत को जोड़ता है
              </p>
              <p className="mt-2 text-base sm:text-lg font-bold text-[var(--saarthi-on-surface-variant)] max-w-3xl">
                किसान और खरीदार के बीच सीधा, भरोसेमंद और लाभदायक संबंध
              </p>
            </div>
            <div ref={logoRef} className="flex items-center gap-3 rounded-3xl border border-white/55 bg-white/75 backdrop-blur-xl px-4 py-3 shadow-sm">
              <img src="/images/saarthi_setu_logo.png" alt="सारथी सेतु" className="w-11 h-11 rounded-2xl bg-white ring-1 ring-[var(--saarthi-outline-soft)] p-1" />
              <div>
                <p className="text-sm font-black text-[var(--saarthi-primary)]">सारथी सेतु</p>
                <p className="text-[11px] font-extrabold text-[var(--saarthi-on-surface-variant)]">क्षैतिज स्लाइड स्टोरी</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 pt-6">
          {/* Map (cleaner, centered) */}
          <Glass className="overflow-hidden">
            <div className="relative p-4 sm:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.12),transparent_55%),radial-gradient(circle_at_80%_24%,rgba(251,191,36,0.16),transparent_55%)]" />
              <div className="relative">
                <div className="absolute left-6 right-6 bottom-6 h-10 rounded-3xl bg-[rgba(24,29,23,0.06)]" />

                <div ref={mapRef} className="relative mx-auto w-full max-w-[860px]">
                  {/* Map base */}
                  <img
                    src="/images/india_crop_map_ref.png"
                    alt="भारत का नक्शा"
                    className="w-full h-auto block"
                    style={{ filter: 'saturate(0.85) contrast(1.04)' }}
                  />

                  {/* Overlay: routes + movers (minimal) */}
                  <svg viewBox="0 0 1000 650" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgba(34,197,94,0.25)" />
                        <stop offset="55%" stopColor="rgba(34,197,94,0.95)" />
                        <stop offset="100%" stopColor="rgba(251,191,36,0.95)" />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgba(245,158,11,0.25)" />
                        <stop offset="55%" stopColor="rgba(245,158,11,0.95)" />
                        <stop offset="100%" stopColor="rgba(220,38,38,0.95)" />
                      </linearGradient>
                      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="6" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    <path
                      ref={routeDLtoMPRef}
                      d="M625 210 C 595 240, 565 280, 548 325"
                      fill="none"
                      stroke="url(#g1)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      opacity={slide >= 1 ? 1 : 0}
                    />
                    <path
                      ref={routeMPtoMHRef}
                      d="M548 325 C 520 370, 480 420, 446 455"
                      fill="none"
                      stroke="url(#g2)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      opacity={slide >= 2 ? 1 : 0}
                    />

                    {/* Nodes */}
                    <g filter="url(#glow)">
                      <circle cx="625" cy="210" r="10" fill={slide >= 0 ? 'rgba(34,197,94,0.95)' : 'rgba(34,197,94,0.70)'} stroke="white" strokeWidth="4" />
                      <circle cx="548" cy="325" r="10" fill={slide >= 1 ? 'rgba(34,197,94,0.95)' : 'rgba(34,197,94,0.70)'} stroke="white" strokeWidth="4" />
                      <circle cx="446" cy="455" r="10" fill={slide >= 2 ? 'rgba(34,197,94,0.95)' : 'rgba(34,197,94,0.70)'} stroke="white" strokeWidth="4" />
                    </g>

                    {/* Movers */}
                    <circle ref={dotRef} cx="625" cy="210" r="9" fill="rgba(34,197,94,0.95)" stroke="white" strokeWidth="4" filter="url(#glow)" />
                    <g ref={truckRef} transform="translate(548 325)">
                      <rect x="-22" y="-14" width="44" height="26" rx="12" fill="rgba(255,255,255,0.94)" stroke="rgba(112,122,108,0.25)" />
                      <rect x="-6" y="-10" width="20" height="16" rx="6" fill="rgba(245,158,11,0.22)" />
                      <circle cx="-12" cy="16" r="4.5" fill="rgba(24,29,23,0.35)" />
                      <circle cx="12" cy="16" r="4.5" fill="rgba(24,29,23,0.35)" />
                    </g>
                  </svg>
                </div>

                {/* Clean highlight card (single, not stacked) */}
                <div className="mt-4 rounded-3xl border border-white/60 bg-white/75 backdrop-blur px-4 py-3 shadow-sm flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl grid place-items-center bg-[rgba(34,197,94,0.12)] border border-white/60 text-lg font-black text-[var(--saarthi-primary)]">
                      {SLIDES[slide].icon}
                    </span>
                    <div>
                      <p className="text-sm font-black text-[var(--saarthi-on-background)]">{SLIDES[slide].title}</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-bold text-[var(--saarthi-on-surface-variant)]">{SLIDES[slide].meta}</p>
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-black text-[var(--saarthi-primary)]">{SLIDES[slide].big}</div>
                </div>
              </div>
            </div>
          </Glass>

          {/* Horizontal slides (scroll-driven) */}
          <div className="mt-5">
            <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/65 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
              <div ref={trackRef} className="flex w-[400%]">
                {SLIDES.map((s) => (
                  <div key={s.k} className="w-full shrink-0 p-5 sm:p-6">
                    <div className="grid md:grid-cols-[0.6fr_1fr] gap-5 items-center">
                      <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur px-5 py-5 shadow-sm">
                        <p className="text-[11px] font-extrabold text-[var(--saarthi-on-surface-variant)]">स्टेप {s.k + 1}</p>
                        <p className="mt-2 text-xl sm:text-2xl font-black text-[var(--saarthi-on-background)]">{s.title}</p>
                        <p className="mt-3 text-lg sm:text-xl font-black text-[var(--saarthi-primary)]">{s.big}</p>
                        <p className="mt-2 text-sm font-bold text-[var(--saarthi-on-surface-variant)]">{s.meta}</p>
                      </div>

                      <div className="rounded-3xl border border-white/60 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.14),transparent_55%),radial-gradient(circle_at_80%_24%,rgba(251,191,36,0.18),transparent_55%)] px-6 py-6">
                        <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur px-6 py-6 shadow-sm">
                          {s.k === 0 ? (
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-3xl grid place-items-center bg-white border border-white/70">📱</div>
                              <div>
                                <p className="text-sm font-black text-[var(--saarthi-on-background)]">दिल्ली खरीदार</p>
                                <p className="mt-1 text-lg font-black text-[var(--saarthi-primary)]">ऑर्डर डाल दिया</p>
                              </div>
                            </div>
                          ) : s.k === 1 ? (
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-3xl grid place-items-center bg-white border border-white/70">🧑‍🌾</div>
                              <div>
                                <p className="text-sm font-black text-[var(--saarthi-on-background)]">MP किसान</p>
                                <p className="mt-1 text-lg font-black text-[var(--saarthi-primary)]">“स्वीकार करें” टैप</p>
                              </div>
                            </div>
                          ) : s.k === 2 ? (
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-3xl grid place-items-center bg-white border border-white/70">🚛</div>
                              <div>
                                <p className="text-sm font-black text-[var(--saarthi-on-background)]">ट्रांसपोर्ट बुक</p>
                                <p className="mt-1 text-lg font-black text-[var(--saarthi-primary)]">ट्रक रवाना</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-3xl grid place-items-center bg-white border border-white/70">✅</div>
                              <div>
                                <p className="text-sm font-black text-[var(--saarthi-on-background)]">डिलीवरी पूर्ण</p>
                                <p className="mt-1 text-lg font-black text-[var(--saarthi-primary)]">भुगतान मिल गया</p>
                              </div>
                            </div>
                          )}

                          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                            <div className="text-sm font-extrabold text-[var(--saarthi-on-surface-variant)]">
                              स्लाइड {s.k + 1} / {SLIDES.length}
                            </div>
                            <button
                              type="button"
                              onClick={onCtaClick}
                              className="min-h-[46px] px-5 rounded-2xl bg-[var(--saarthi-primary)] text-white font-black shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
                            >
                              अभी जुड़ें
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs font-bold text-[var(--saarthi-on-surface-variant)]">
                नीचे की स्लाइड्स क्षैतिज हैं — स्क्रोल करते रहें।
              </p>
              <div className="flex items-center gap-1.5">
                {SLIDES.map((s) => (
                  <span
                    key={s.k}
                    className={`h-2.5 w-2.5 rounded-full border ${slide === s.k ? 'bg-[var(--saarthi-primary)] border-[var(--saarthi-primary)]' : 'bg-white/70 border-white/70'}`}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

