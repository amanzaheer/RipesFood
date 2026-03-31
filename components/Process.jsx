"use client";

import { useLayoutEffect, useRef } from "react";
import gsap, { ScrollTrigger } from "../lib/gsap";

const STEPS = [
  {
    key: "sourcing",
    title: "Sourcing",
    desc: "High-quality farms with consistent supply and premium produce standards.",
    icon: "farm",
  },
  {
    key: "quality",
    title: "Quality Check",
    desc: "Inspection & standards to ensure safe, export-ready products every time.",
    icon: "shield",
  },
  {
    key: "packaging",
    title: "Packaging",
    desc: "Safe & export-ready packaging designed to protect freshness during transit.",
    icon: "box",
  },
  {
    key: "shipping",
    title: "Global Shipping",
    desc: "Worldwide delivery with reliable logistics and on-time performance.",
    icon: "globe",
  },
];

function StepIcon({ type }) {
  const common = "h-5 w-5";
  const stroke = "rgba(255, 255, 255, 0.9)";
  const fill = "rgba(255, 255, 255, 0.06)";

  switch (type) {
    case "farm":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 20h18"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M5 20V10.5L12 6l7 4.5V20"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={fill}
          />
          <path
            d="M9.2 20v-6.2c0-.7.6-1.3 1.3-1.3h2c.7 0 1.3.6 1.3 1.3V20"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3l8 4v6c0 5-3.4 8.4-8 8.4S4 18 4 13V7l8-4z"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={fill}
          />
          <path
            d="M9 12l2 2 4-5"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "box":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 8.5l-9 4.5-9-4.5L12 4l9 4.5z"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={fill}
          />
          <path
            d="M3 8.5V16c0 .8.5 1.5 1.2 1.8L12 21l7.8-3.2c.7-.3 1.2-1 1.2-1.8V8.5"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 13v8"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "globe":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"
            stroke={stroke}
            strokeWidth="1.6"
            fill={fill}
          />
          <path
            d="M2 12h20"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M12 2c3 3.6 3 16.4 0 20-3-3.6-3-16.4 0-20z"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

/** Subtle film grain + slow drift (Apple-style atmosphere) */
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] opacity-[0.35] mix-blend-overlay"
      aria-hidden
    >
      <svg className="h-full w-full">
        <filter id="processNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" />
        </filter>
        <rect width="100%" height="100%" filter="url(#processNoise)" opacity="0.55" />
      </svg>
    </div>
  );
}

/** Blurred produce imagery + soft color motion (works without image files via gradients) */
function ProduceBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Slow gradient drift */}
      <div className="process-bg-drift absolute -inset-[20%] opacity-90" />

      {/* Optional real photos — hidden if missing; gradients still show */}
      <div
        className="absolute -right-[8%] top-[5%] h-[min(55vh,420px)] w-[min(55vw,480px)] rounded-[40%] bg-cover bg-center opacity-[0.14] mix-blend-soft-light blur-[2px] process-float-slow"
        style={{ backgroundImage: "url(/fruits.avif)" }}
      />
      <div
        className="absolute -left-[5%] bottom-[8%] h-[min(45vh,380px)] w-[min(50vw,440px)] rounded-[45%] bg-cover bg-center opacity-[0.12] mix-blend-soft-light blur-[2px] process-float-slow-reverse"
        style={{ backgroundImage: "url(/vegetables.avif)" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[min(40vh,320px)] w-[min(45vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-cover bg-center opacity-[0.08] mix-blend-overlay blur-[3px] process-float-mid"
        style={{ backgroundImage: "url(/grains.avif)" }}
      />

      <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-black/85" />
    </div>
  );
}

export default function Process() {
  const sectionRef = useRef(null);
  const linePathRef = useRef(null);
  const glowPathRef = useRef(null);
  const stepRefs = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const path = linePathRef.current;
    const glowPath = glowPathRef.current;
    if (!section || !path) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const len = path.getTotalLength();
    const glowLen = glowPath?.getTotalLength?.() ?? len;

    gsap.set(path, {
      strokeDasharray: len,
      strokeDashoffset: prefersReducedMotion ? 0 : len,
    });
    if (glowPath) {
      gsap.set(glowPath, {
        strokeDasharray: glowLen,
        strokeDashoffset: prefersReducedMotion ? 0 : glowLen,
      });
    }

    const triggers = [];

    if (!prefersReducedMotion) {
      const lineSt = ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        end: "bottom 30%",
        scrub: 0.85,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(path, { strokeDashoffset: len * (1 - p) });
          if (glowPath) gsap.set(glowPath, { strokeDashoffset: glowLen * (1 - p) });
        },
      });
      triggers.push(lineSt);
    }

    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      if (prefersReducedMotion) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      const st = gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          delay: i * 0.06,
        },
      );
      if (st.scrollTrigger) triggers.push(st.scrollTrigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative z-10 scroll-mt-24 overflow-hidden py-20 text-white md:py-28"
    >
      <style>{`
        .process-bg-drift {
          background:
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(34, 197, 94, 0.22), transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 20%, rgba(251, 191, 36, 0.14), transparent 50%),
            radial-gradient(ellipse 60% 45% at 50% 90%, rgba(22, 163, 74, 0.12), transparent 45%);
          animation: processDrift 22s ease-in-out infinite;
        }
        @keyframes processDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(2%, -1%) scale(1.03); }
          66% { transform: translate(-1.5%, 2%) scale(0.98); }
        }
        .process-float-slow {
          animation: processFloat1 28s ease-in-out infinite;
        }
        .process-float-slow-reverse {
          animation: processFloat2 32s ease-in-out infinite;
        }
        .process-float-mid {
          animation: processFloat3 24s ease-in-out infinite;
        }
        @keyframes processFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-3%, 4%) rotate(2deg); }
        }
        @keyframes processFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(4%, -3%) rotate(-2deg); }
        }
        @keyframes processFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-48%, -52%) scale(1.04); }
        }
        .process-line-glow {
          filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.55));
        }
      `}</style>

      <div className="absolute inset-0 bg-neutral-950" />
      <ProduceBackdrop />
      <GrainOverlay />

      <div className="relative z-[2] mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="mb-12 max-w-2xl md:mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-400/90">
            Process
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.9rem] lg:leading-tight">
            Premium Workflow From Farm to World
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
            We manage sourcing, inspections, packaging, and global logistics as
            one continuous story—so your order arrives safe, fresh, and
            export-ready.
          </p>
        </div>

        <div className="relative flex gap-0 md:gap-2">
          {/* Left timeline: SVG line (stroke-dash) animates reliably; no scaleY issues */}
          <div
            className="relative w-11 shrink-0 md:w-14"
            aria-hidden
          >
            <svg
              className="absolute left-1/2 top-2 h-[calc(100%-1rem)] w-10 -translate-x-1/2 overflow-visible md:w-12"
              viewBox="0 0 48 1000"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="processLineGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="processLineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#fcd34d" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {/* Track */}
              <path
                d="M 24 8 L 24 992"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Soft glow under main stroke */}
              <path
                ref={glowPathRef}
                className="process-line-glow"
                d="M 24 8 L 24 992"
                fill="none"
                stroke="url(#processLineGlow)"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.65"
              />
              {/* Main animated line */}
              <path
                ref={linePathRef}
                d="M 24 8 L 24 992"
                fill="none"
                stroke="url(#processLineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1 space-y-6 pb-2 md:space-y-8">
            {STEPS.map((step, idx) => (
              <div key={step.key} className="relative">
                {/* Node aligned to card */}
                <span
                  className="absolute left-[calc(-1.375rem)] top-8 z-[3] flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full border border-amber-400/40 bg-neutral-950 shadow-[0_0_12px_rgba(251,191,36,0.45)] md:left-[calc(-1.75rem)] md:top-9 md:h-4 md:w-4"
                  aria-hidden
                >
                  <span className="h-2 w-2 rounded-full bg-linear-to-br from-amber-200 to-emerald-400 md:h-2.5 md:w-2.5" />
                </span>

                <article
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className="process-step-card group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-6 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md transition-[transform,box-shadow] duration-500 ease-out md:rounded-3xl md:p-8"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(52,211,153,0.12) 0%, transparent 42%, rgba(251,191,36,0.08) 100%)",
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl opacity-70"
                    aria-hidden
                  />

                  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-white/10 to-white/[0.03] ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform duration-500 group-hover:scale-105 group-hover:ring-amber-400/25">
                      <StepIcon type={step.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-400/85">
                        Step {String(idx + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
