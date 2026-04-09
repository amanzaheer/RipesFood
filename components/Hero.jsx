"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "../lib/gsap";

const HERO_CONTAINER_SRC = ["/c11.png", "/c22.png", "/c33.png"];

/** Keyframe loops (px / deg) — Framer Motion drives the inner wrapper so motion always runs in React. */
const HERO_CONTAINER_MOTION = [
  {
    animate: {
      x: [0, 24, -18, -20, 0],
      y: [0, -18, 20, -14, 0],
      rotate: [-1.5, 3.5, -2.2, 2, -1.5],
    },
    transition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
  },
  {
    animate: {
      x: [0, -22, 18, 14, 0],
      y: [0, 14, -20, 16, 0],
      rotate: [1.5, -2.8, 2.5, -1.6, 1.5],
    },
    transition: {
      duration: 13.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.6,
    },
  },
  {
    animate: {
      x: [0, 18, -22, -12, 0],
      y: [0, 20, -14, 22, 0],
      rotate: [0.8, -2.5, 2.2, -1.2, 0.8],
    },
    transition: {
      duration: 11,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1.1,
    },
  },
];

function normalizeWhatsAppNumber(raw) {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;

  // Handle international prefix like 0092...
  if (digits.startsWith("00")) return digits.slice(2);

  // Pakistan local mobile format: 03XXXXXXXXX -> 92XXXXXXXXXX
  if (digits.startsWith("03") && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }

  // If user already entered with country code.
  if (digits.startsWith("92")) return digits;

  // Fallback: if it starts with single 0, drop it and assume Pakistan code.
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;

  return digits;
}

function HeroEarthBackdrop() {
  return (
    <div
      className="hero-earth-anchor pointer-events-none absolute left-1/2 top-[40%] z-0 h-[min(140vw,120vh)] w-[min(140vw,120vh)] -translate-x-1/2 -translate-y-1/2 md:top-[38%]"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(56,189,248,0.22),transparent_42%),radial-gradient(circle_at_68%_58%,rgba(16,185,129,0.2),transparent_45%),radial-gradient(circle_at_48%_72%,rgba(251,191,36,0.08),transparent_38%),radial-gradient(circle_at_50%_50%,#0c1a2e_0%,#030712_72%)] shadow-[inset_0_0_80px_rgba(0,0,0,0.65)]" />
      <div
        className="hero-earth-surface absolute inset-[3%] rounded-full opacity-90 mix-blend-screen"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 28% 35%, rgba(34,197,94,0.35), transparent 50%),
            radial-gradient(ellipse 45% 38% at 62% 42%, rgba(59,130,246,0.25), transparent 48%),
            radial-gradient(ellipse 50% 45% at 48% 68%, rgba(234,179,8,0.12), transparent 52%),
            radial-gradient(circle at 50% 50%, rgba(15,23,42,0.2), transparent 70%)
          `,
        }}
      />
      <div
        className="hero-earth-grid absolute inset-[2%] rounded-full opacity-[0.35]"
        style={{
          background: `
            repeating-conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg 11deg,
              rgba(148,163,184,0.12) 11deg 11.35deg
            )
          `,
          maskImage:
            "radial-gradient(circle at 50% 50%, black 0%, black 48%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, black 0%, black 48%, transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_72%_22%,rgba(255,255,255,0.14),transparent_28%)]" />
    </div>
  );
}

function HeroContainerFigures() {
  const reduceMotion = useReducedMotion();
  const isReduced = reduceMotion === true;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      {HERO_CONTAINER_SRC.map((src, i) => {
        const cfg = HERO_CONTAINER_MOTION[i];
        const subtle = isReduced
          ? {
              animate: {
                x: [0, 5, -4, 0],
                y: [0, -4, 5, 0],
                rotate: [0, 0.8, -0.8, 0],
              },
              transition: {
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              },
            }
          : { animate: cfg.animate, transition: cfg.transition };

        return (
          <div
            key={src}
            className={`absolute ${
              i === 0
                ? "bottom-[10%] left-[-2%] w-[min(48vw,240px)] sm:bottom-[14%] sm:left-[1%] sm:w-[min(40vw,280px)] md:bottom-[12%] md:left-[3%] md:w-[min(32vw,340px)]"
                : i === 1
                  ? "right-[-4%] top-[16%] w-[min(44vw,220px)] sm:right-[0%] sm:top-[18%] sm:w-[min(36vw,260px)] md:right-[4%] md:top-[14%] md:w-[min(28vw,300px)]"
                  : "bottom-[6%] right-[4%] w-[min(40vw,200px)] sm:bottom-[8%] sm:right-[8%] sm:w-[min(34vw,240px)] md:bottom-[10%] md:right-[10%] md:w-[min(26vw,280px)]"
            }`}
          >
            <motion.div
              className="w-full will-change-transform"
              style={{ transformOrigin: "50% 55%" }}
              initial={false}
              animate={subtle.animate}
              transition={subtle.transition}
            >
              <img
                src={src}
                alt=""
                width={800}
                height={800}
                className="h-auto w-full select-none object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
                decoding="async"
                fetchPriority="high"
              />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const buttonRef = useRef(null);

  const fullHeading = "Good Products. Fast Delivery.";
  const fullSub =
    "Fruits, vegetables, grains & pulses—trusted import/export partners for reliability and repeat business.";

  const [typedHeading, setTypedHeading] = useState("");
  const [typedSub, setTypedSub] = useState("");

  const glowRef = useRef(null);
  const glowTweenRef = useRef(null);

  const heroInViewRef = useRef(false);
  const typingRunIdRef = useRef(0);
  const typingTimeoutsRef = useRef([]);

  const clearTypingTimers = useCallback(() => {
    typingTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    typingTimeoutsRef.current = [];
  }, []);

  const startTyping = useCallback(() => {
    clearTypingTimers();
    typingRunIdRef.current += 1;
    const runId = typingRunIdRef.current;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setTypedHeading(fullHeading);
      setTypedSub(fullSub);
      return;
    }

    setTypedHeading("");
    setTypedSub("");

    const typeChar = (text, setter, speedMs, onDone) => {
      let idx = 0;

      const tick = () => {
        if (typingRunIdRef.current !== runId) return;
        idx += 1;
        setter(text.slice(0, idx));

        if (idx >= text.length) {
          onDone?.();
          return;
        }
        typingTimeoutsRef.current.push(window.setTimeout(tick, speedMs));
      };

      typingTimeoutsRef.current.push(window.setTimeout(tick, speedMs));
    };

    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );
    }
    if (subRef.current) {
      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );
    }

    typeChar(fullHeading, setTypedHeading, 18, () => {
      typeChar(fullSub, setTypedSub, 9);
    });
  }, [clearTypingTimers, fullHeading, fullSub]);

  const startGlow = useCallback(() => {
    if (!glowRef.current) return;
    glowTweenRef.current?.kill?.();

    glowTweenRef.current = gsap.to(glowRef.current, {
      opacity: 1,
      scale: 1.06,
      duration: 1.0,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, []);

  const stopGlow = useCallback(() => {
    glowTweenRef.current?.kill?.();
    glowTweenRef.current = null;
    if (glowRef.current) gsap.set(glowRef.current, { opacity: 0, scale: 1 });
  }, []);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const fallbackWhatsappNumber = "03455599900";
  const resolvedWhatsappNumber =
    typeof whatsappNumber === "string" && whatsappNumber.trim()
      ? whatsappNumber
      : fallbackWhatsappNumber;
  const whatsappMessage =
    import.meta.env.VITE_WHATSAPP_MESSAGE ??
    "Hi! I’d like a quote for RipesFood products.";
  const whatsappE164 = normalizeWhatsAppNumber(resolvedWhatsappNumber);
  const whatsappUrl = whatsappE164
    ? `https://wa.me/${whatsappE164}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  /** Always open WhatsApp chat using env number or project fallback. */
  const whatsappHref =
    whatsappUrl ??
    `https://wa.me/${normalizeWhatsAppNumber(fallbackWhatsappNumber)}`;

  useEffect(() => {
    if (!sectionRef.current) return;

    const el = sectionRef.current;

    // Stop any in-flight typing and animation when setting up observers.
    clearTypingTimers();
    stopGlow();
    heroInViewRef.current = false;

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.target !== el) continue;
                const inView =
                  entry.isIntersecting && (entry.intersectionRatio ?? 0) > 0.25;

                if (inView && !heroInViewRef.current) {
                  heroInViewRef.current = true;
                  startGlow();
                  startTyping();
                }

                if (!inView && heroInViewRef.current) {
                  heroInViewRef.current = false;
                  stopGlow();
                  clearTypingTimers();
                  setTypedHeading("");
                  setTypedSub("");
                }
              }
            },
            { threshold: [0.1, 0.25, 0.4, 0.6] },
          )
        : null;

    if (!io) {
      // Fallback: always animate + type.
      heroInViewRef.current = true;
      startGlow();
      startTyping();
      return undefined;
    }

    io.observe(el);
    return () => {
      io.disconnect();
      stopGlow();
      clearTypingTimers();
    };
  }, [clearTypingTimers, startGlow, startTyping, stopGlow]);

  return (
    <>
      {/* Fixed viewport banner: stays put while the page scrolls (products section covers it). */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
        aria-hidden
      >
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/90 via-[#04120f]/85 to-black" />
        <HeroEarthBackdrop />
        <HeroContainerFigures />
        <div className="absolute inset-0 z-[2] bg-linear-to-b from-black/50 via-black/20 to-black/65" />
        <div className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_90%_65%_at_50%_42%,transparent_0%,rgba(0,0,0,0.5)_70%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      <a
        href={whatsappHref}
        target={whatsappUrl ? "_blank" : undefined}
        rel={whatsappUrl ? "noreferrer" : undefined}
        title={
          whatsappUrl
            ? "Chat on WhatsApp"
            : "Contact — add VITE_WHATSAPP_NUMBER for WhatsApp"
        }
        aria-label={whatsappUrl ? "Chat on WhatsApp" : "Go to contact section"}
        className="whatsapp-fab fixed bottom-4 right-4 z-130 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-black ring-2 ring-white/50 transition-transform duration-200 hover:scale-110 hover:ring-white/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 sm:bottom-6 sm:right-6 sm:h-13 sm:w-13"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="currentColor"
          className="drop-shadow-sm"
          aria-hidden
        >
          <path d="M19.06 17.03c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.18.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.12-.12.27-.35.4-.52.13-.17.17-.29.27-.49.1-.2.05-.38-.02-.53-.07-.15-.67-1.63-.92-2.23-.24-.58-.49-.5-.67-.51-.17-.01-.36-.01-.55-.01-.18 0-.48.07-.73.35-.25.28-.95.93-.95 2.26s.97 2.62 1.11 2.8c.14.18 1.92 3.03 4.66 4.12 2.74 1.09 2.74.73 3.24.68.5-.05 1.6-.65 1.82-1.28.23-.63.23-1.16.17-1.28-.06-.12-.24-.2-.54-.35Z" />
          <path d="M16 2C8.82 2 3 7.82 3 15c0 2.96 1.01 5.69 2.7 7.86L4 30l7.36-1.67c2.1 1.56 4.68 2.45 7.64 2.45 7.18 0 13-5.82 13-13S23.18 2 16 2Zm0 25.4c-2.7 0-5.2-1-7.1-2.66l-.48-.42-4.5 1.02 1.03-4.33-.44-.5C4.73 15.9 4.1 13.5 4.1 15c0-6.56 5.34-11.9 11.9-11.9S27.9 8.44 27.9 15 22.56 27.4 16 27.4Z" />
        </svg>
      </a>

      <section
        ref={sectionRef}
        id="home"
        className="relative z-10 min-h-svh w-full max-w-full scroll-mt-24 overflow-x-hidden"
      >
        <div className="pointer-events-none flex min-h-svh w-full max-w-full items-center justify-center px-4 text-center sm:px-6">
          <div className="relative min-w-0 max-w-3xl pointer-events-auto">
            <div
              ref={glowRef}
              className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-linear-to-r from-emerald-500/20 via-amber-300/10 to-emerald-500/20 blur-3xl opacity-0 sm:-inset-10"
            />
            <h1
              ref={headingRef}
              className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl"
            >
              {typedHeading}
            </h1>
            <p
              ref={subRef}
              className="mt-5 text-lg leading-relaxed text-white/80 sm:text-2xl"
            >
              {typedSub}
            </p>

            <div ref={buttonRef} className="mt-9 flex justify-center">
              <button
                type="button"
                className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/60"
                onClick={() => {
                  // Placeholder CTA action for the project foundation.
                }}
              >
                Request a Quote
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
