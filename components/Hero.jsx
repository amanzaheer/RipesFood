"use client";

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "../lib/gsap";

const Scene = lazy(() => import("./3d/Scene"));

/** Hero 3D is heavy on phones; static backdrop avoids slow loads & WebGL tab reloads. */
const HERO_WEBGL_MIN_WIDTH = 768;
const SESSION_LOADER_KEY = "ripesfood_hero_loader_done_v2";
/** Old flag skipped the loader forever after one visit — remove so behavior is predictable. */
const LEGACY_LOADER_KEY = "ripesfood_hero_3d_ready_v1";

function readUseHeroWebgl() {
  if (typeof window === "undefined") return true;
  return window.matchMedia(`(min-width: ${HERO_WEBGL_MIN_WIDTH}px)`).matches;
}

function isReloadNavigation() {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav && typeof nav.type === "string") return nav.type === "reload";
  } catch {
    /* ignore */
  }
  try {
    const { navigation } = performance;
    return typeof navigation !== "undefined" && navigation.type === 1;
  } catch {
    return false;
  }
}

function readInitialLoaderVisible(webglEnabled) {
  if (typeof window === "undefined") return true;
  if (!webglEnabled) return false;
  try {
    if (isReloadNavigation()) return true;
    return sessionStorage.getItem(SESSION_LOADER_KEY) !== "1";
  } catch {
    return true;
  }
}

export default function Hero() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const buttonRef = useRef(null);

  const loaderMessages = [
    "Importing fresh supply",
    "Preparing export routes",
    "Packaging quality for delivery",
  ];

  const fullHeading = "Good Products. Fast Delivery.";
  const fullSub =
    "Fruits, vegetables, grains & pulses—trusted import/export partners for reliability and repeat business.";

  const [typedHeading, setTypedHeading] = useState("");
  const [typedSub, setTypedSub] = useState("");

  const [useHeroWebgl, setUseHeroWebgl] = useState(() => readUseHeroWebgl());
  const [show3dLoader, setShow3dLoader] = useState(() =>
    readInitialLoaderVisible(readUseHeroWebgl()),
  );
  const [loaderMsgIndex, setLoaderMsgIndex] = useState(0);
  const [loaderPercent, setLoaderPercent] = useState(0);
  const hideLoaderTimeoutRef = useRef(null);
  const loaderDoneRef = useRef(false);
  const loaderTickRef = useRef(null);
  const loaderMaxWaitRef = useRef(null);

  const glowRef = useRef(null);
  const glowTweenRef = useRef(null);

  const heroInViewRef = useRef(false);
  const typingRunIdRef = useRef(0);
  const typingTimeoutsRef = useRef([]);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_LOADER_KEY);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${HERO_WEBGL_MIN_WIDTH}px)`);
    const sync = () => {
      const next = mq.matches;
      setUseHeroWebgl(next);
      if (!next) setShow3dLoader(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!show3dLoader) return;

    setLoaderMsgIndex(0);
    const id = window.setInterval(() => {
      setLoaderMsgIndex((i) => (i + 1) % loaderMessages.length);
    }, 1400);

    return () => window.clearInterval(id);
  }, [show3dLoader]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishHeroLoader = useCallback(() => {
    if (loaderDoneRef.current) return;
    loaderDoneRef.current = true;

    try {
      sessionStorage.setItem(SESSION_LOADER_KEY, "1");
    } catch {
      // ignore
    }

    if (loaderTickRef.current) {
      window.clearInterval(loaderTickRef.current);
      loaderTickRef.current = null;
    }
    if (loaderMaxWaitRef.current) {
      window.clearTimeout(loaderMaxWaitRef.current);
      loaderMaxWaitRef.current = null;
    }

    setLoaderPercent(100);

    if (hideLoaderTimeoutRef.current) {
      window.clearTimeout(hideLoaderTimeoutRef.current);
    }
    hideLoaderTimeoutRef.current = window.setTimeout(() => {
      setShow3dLoader(false);
    }, 400);
  }, []);

  useEffect(() => {
    if (!show3dLoader) return;

    loaderDoneRef.current = false;
    setLoaderPercent(2);

    const start = Date.now();
    const maxWaitMs = 9000;

    loaderTickRef.current = window.setInterval(() => {
      if (loaderDoneRef.current) return;
      const elapsed = Date.now() - start;
      const asymptotic = 100 * (1 - Math.exp(-elapsed / 2800));
      const next = Math.min(99, Math.floor(asymptotic));
      setLoaderPercent((prev) => Math.max(prev, next));
    }, 100);

    loaderMaxWaitRef.current = window.setTimeout(() => {
      finishHeroLoader();
    }, maxWaitMs);

    return () => {
      if (loaderTickRef.current) {
        window.clearInterval(loaderTickRef.current);
        loaderTickRef.current = null;
      }
      if (loaderMaxWaitRef.current) {
        window.clearTimeout(loaderMaxWaitRef.current);
        loaderMaxWaitRef.current = null;
      }
    };
  }, [show3dLoader, finishHeroLoader]);

  const handleSceneModelReady = useCallback(() => {
    finishHeroLoader();
  }, [finishHeroLoader]);

  const clearTypingTimers = useCallback(() => {
    typingTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    typingTimeoutsRef.current = [];
  }, []);

  const startTyping = useCallback(() => {
    if (show3dLoader) return;

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
  }, [clearTypingTimers, fullHeading, fullSub, show3dLoader]);

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
  const whatsappMessage =
    import.meta.env.VITE_WHATSAPP_MESSAGE ??
    "Hi! I’d like a quote for RipesFood products.";
  const whatsappUrl =
    typeof whatsappNumber === "string" && whatsappNumber.trim()
      ? (() => {
          const digitsOnly = whatsappNumber.replace(/[^\d]/g, "");
          return digitsOnly
            ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(
                whatsappMessage,
              )}`
            : null;
        })()
      : null;

  /** Always show FAB; scroll to contact if no number configured */
  const whatsappHref = whatsappUrl ?? "#contact";

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

  useEffect(() => {
    if (!show3dLoader && heroInViewRef.current && !typedHeading) {
      startTyping();
      startGlow();
    }
  }, [show3dLoader, startGlow, startTyping, typedHeading]);

  return (
    <>
      {show3dLoader ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          aria-hidden="true"
        >
          <div className="w-[92%] max-w-md rounded-3xl border border-white/10 bg-neutral-950/80 p-6 text-center shadow-[0_24px_80px_-30px_rgba(0,0,0,0.9)]">
            <p className="mt-1 text-sm font-medium text-white/70">
              Loading your experience
            </p>
            <p className="mt-2 text-balance text-xl font-semibold tracking-tight text-white">
              {loaderMessages[loaderMsgIndex]}
            </p>

            <div className="mt-4 text-sm font-semibold text-emerald-300/80">
              {Math.round(loaderPercent)}%
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-linear-to-r from-emerald-400 via-amber-300 to-emerald-400 transition-[width] duration-500"
                style={{ width: `${loaderPercent}%` }}
              />
            </div>

            <p className="mt-4 text-xs text-white/50">
              Tip: Move your mouse once it finishes loading.
            </p>
          </div>
        </div>
      ) : null}

      {/* Fixed viewport banner: stays put while the page scrolls (products section covers it). */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
        aria-hidden
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/15 to-black/55" />
        {/* No scale on small screens — scale + WebGL canvas often causes horizontal overflow. */}
        <div className="absolute inset-0 origin-center scale-100 md:scale-105 lg:scale-[1.12]">
          {useHeroWebgl ? (
            <Suspense fallback={null}>
              <Scene onModelReady={handleSceneModelReady} />
            </Suspense>
          ) : (
            <div className="absolute inset-0" aria-hidden>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_88%_70%_at_50%_38%,rgba(249,115,22,0.2),transparent_58%),radial-gradient(ellipse_65%_55%_at_72%_62%,rgba(52,211,153,0.12),transparent_52%)]" />
              <div className="absolute inset-0 bg-linear-to-b from-black/45 via-transparent to-black/75" />
            </div>
          )}
        </div>
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
