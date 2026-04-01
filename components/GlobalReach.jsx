"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap, { ScrollTrigger } from "../lib/gsap";

const DESTINATIONS = [
  { key: "ae", name: "UAE", x: 518, y: 218 },
  { key: "sa", name: "Saudi Arabia", x: 462, y: 208 },
  { key: "uk", name: "UK", x: 298, y: 162 },
  { key: "us", name: "USA", x: 168, y: 218 },
  { key: "cn", name: "China", x: 672, y: 248 },
];

const ORIGIN = { key: "pk", name: "Pakistan", x: 438, y: 248 };

function buildRoutePath(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Smooth arc; curve ends exactly at marker center (to.x, to.y).
  const lift = Math.min(95, Math.max(38, dist * 0.18));
  const cx1 = from.x + dx * 0.35;
  const cy1 = from.y - lift;
  const cx2 = to.x - dx * 0.12;
  const cy2 = to.y + lift * 0.45;

  return `M ${from.x} ${from.y} C ${cx1} ${cy1} ${cx2} ${cy2} ${to.x} ${to.y}`;
}

function setPathDash(pathEl, offset) {
  const len = pathEl.getTotalLength();
  if (!len || !Number.isFinite(len)) return;
  pathEl.setAttribute("stroke-dasharray", String(len));
  pathEl.setAttribute("stroke-dashoffset", String(offset));
}

function revealAllRoutes(pathEls) {
  pathEls.forEach((pathEl) => {
    if (!pathEl) return;
    const len = pathEl.getTotalLength();
    if (!len || !Number.isFinite(len)) return;
    pathEl.setAttribute("stroke-dashoffset", "0");
  });
}

export default function GlobalReach() {
  const sectionRef = useRef(null);
  const copyBlockRef = useRef(null);
  const mapColumnRef = useRef(null);
  const tooltipRef = useRef(null);
  const svgRef = useRef(null);

  const [hovered, setHovered] = useState(null); // { key, name }

  const routeDefs = useMemo(() => {
    const routes = DESTINATIONS.map((d, idx) => {
      const pathD = buildRoutePath(ORIGIN, d);
      return {
        key: d.key,
        name: d.name,
        from: ORIGIN,
        to: d,
        d: pathD,
        index: idx,
      };
    });
    return routes;
  }, []);

  const routePathRefs = useRef({});
  const markerGroupRefs = useRef({});
  const markerInnerRefs = useRef({});

  const planeRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const copyBlock = copyBlockRef.current;
    const mapColumn = mapColumnRef.current;
    const svgEl = svgRef.current;
    if (!section || !copyBlock || !mapColumn || !svgEl) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Animate copy + map column only — never fade the whole section or the fixed Hero
    // 3D layer bleeds through as a giant blob while section opacity is below 1.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        end: "top 35%",
        scrub: 0.75,
      },
    });

    tl.fromTo(
      copyBlock,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 1, ease: "none" },
      0,
    ).fromTo(
      mapColumn,
      { opacity: 0, y: 18, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 1.05, ease: "none" },
      0.12,
    );

    const routePathEls = routeDefs
      .map((r) => routePathRefs.current[r.key])
      .filter(Boolean);

    routePathEls.forEach((pathEl) => {
      const len = pathEl.getTotalLength();
      if (!len || !Number.isFinite(len)) return;
      setPathDash(pathEl, len);
    });

    const routeByIndex = routeDefs.slice();
    const routeLengths = {};
    routeDefs.forEach((r) => {
      const p = routePathRefs.current[r.key];
      if (!p) return;
      routeLengths[r.key] = p.getTotalLength();
    });

    const updatePlane = (progress) => {
      const plane = planeRef.current;
      if (!plane) return;

      const total = routeByIndex.length;
      const scaled = progress * total;
      const seg = Math.floor(scaled);
      const local = scaled - seg;

      const current = routeByIndex[seg];
      if (!current) {
        plane.style.opacity = 0;
        return;
      }

      const pathEl = routePathRefs.current[current.key];
      const length = routeLengths[current.key] || 0;
      if (!pathEl || !length) return;

      plane.style.opacity = 1;

      const t = Math.max(0, Math.min(1, local));
      const l = length * t;
      const pt = pathEl.getPointAtLength(l);

      const eps = Math.max(2, length * 0.002);
      const pt2 = pathEl.getPointAtLength(Math.min(length, l + eps));
      const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x);

      const deg = (angle * 180) / Math.PI;
      plane.setAttribute(
        "transform",
        `translate(${pt.x} ${pt.y}) rotate(${deg})`,
      );
    };

    let drawTl = null;
    let planeTrigger = null;

    if (prefersReducedMotion) {
      revealAllRoutes(routePathEls);
    } else {
      // Longer scrub distance so progress can reach 1.0 and every line fully draws.
      const routeScroll = {
        trigger: section,
        start: "top 72%",
        end: () =>
          `+=${Math.round(
            Math.max(
              section.offsetHeight * 2.25,
              typeof window !== "undefined" ? window.innerHeight * 1.15 : 900,
            ),
          )}`,
        scrub: 0.7,
        invalidateOnRefresh: true,
      };

      drawTl = gsap.timeline({
        scrollTrigger: {
          ...routeScroll,
          onUpdate: (self) => {
            if (self.progress >= 0.985) {
              revealAllRoutes(routePathEls);
            }
          },
          onLeave: () => revealAllRoutes(routePathEls),
        },
      });

      drawTl.to(routePathEls, {
        attr: { strokeDashoffset: 0 },
        duration: 1,
        ease: "none",
        stagger: 0.06,
      });

      planeTrigger = ScrollTrigger.create({
        ...routeScroll,
        onUpdate: (self) => updatePlane(self.progress),
      });
    }

    // Pulsing markers (selected destinations).
    if (!prefersReducedMotion) {
      DESTINATIONS.forEach((d, i) => {
        const groupEl = markerGroupRefs.current[d.key];
        const innerEl = markerInnerRefs.current[d.key];
        if (!groupEl || !innerEl) return;

        gsap.set(groupEl, {
          transformOrigin: "center",
          transformBox: "fill-box",
        });
        gsap.set(innerEl, {
          transformOrigin: "center",
          transformBox: "fill-box",
        });

        gsap.to(groupEl, {
          scale: 1.35,
          opacity: 1,
          duration: 1.55,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.18,
        });

        gsap.to(innerEl, {
          scale: 1.15,
          opacity: 1,
          duration: 1.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.1,
        });
      });
    } else {
      // Reduced motion: show markers static.
      DESTINATIONS.forEach((d) => {
        const groupEl = markerGroupRefs.current[d.key];
        if (!groupEl) return;
        gsap.set(groupEl, { scale: 1, opacity: 1 });
      });
    }

    // Parallax: subtle map movement with mouse.
    let raf = 0;
    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1..1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        gsap.to(mapColumn, {
          x: nx * 8,
          y: ny * 5,
          duration: 0.35,
          ease: "power3.out",
        });
      });
    };

    if (!prefersReducedMotion) {
      section.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      section.removeEventListener("pointermove", onMove);
      tl.scrollTrigger?.kill?.();
      drawTl?.scrollTrigger?.kill?.();
      planeTrigger?.kill?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeDefs]);

  const onMarkerEnter = (d, e) => {
    const container = sectionRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHovered({ key: d.key, name: d.name });

    // Position tooltip slightly offset.
    tooltip.style.opacity = "1";
    tooltip.style.transform = `translate(${x + 14}px, ${y - 12}px)`;
  };

  const onMarkerMove = (d, e) => {
    const container = sectionRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    tooltip.style.transform = `translate(${x + 14}px, ${y - 12}px)`;
  };

  const onMarkerLeave = () => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    tooltip.style.opacity = "0";
    setHovered(null);
  };

  return (
    <section
      ref={sectionRef}
      id="global-reach"
      className="relative z-10 isolate w-full scroll-mt-24 bg-neutral-950 py-20 text-white md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div ref={copyBlockRef} className="relative z-10 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-300/90">
              Global Reach
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.9rem] lg:leading-tight">
              Delivering premium agricultural exports worldwide
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              Delivering premium agricultural products across international
              markets.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span
                  className="h-2 w-2 rounded-full bg-emerald-400"
                  aria-hidden
                />
                Routes from Pakistan
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span
                  className="h-2 w-2 rounded-full bg-yellow-400"
                  aria-hidden
                />
                UAE · Saudi · UK · USA · China
              </span>
            </div>
          </div>

          <div
            ref={mapColumnRef}
            className="relative z-10 min-h-[320px] lg:min-h-[380px]"
          >
            {/* Tooltip */}
            <div
              ref={tooltipRef}
              className="pointer-events-none absolute z-20 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white/90 opacity-0"
              style={{ transition: "opacity 0.15s ease" }}
              aria-hidden
            >
              {hovered?.name || ""}
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 900 450"
              className="h-[380px] w-full"
              role="img"
              aria-label="World export map"
            >
              <defs>
                <linearGradient id="routeStroke" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Stylized continents (clean SVG blobs for premium look). */}
              <g opacity="1">
                <path
                  d="M115 195c-26-55 10-104 56-120 34-12 62 6 84 35 18 24 15 51 0 76-13 21-34 34-58 36-30 2-65-2-82-27z"
                  fill="white"
                  fillOpacity="0.16"
                  stroke="white"
                  strokeOpacity="0.14"
                  strokeWidth="1"
                />
                <path
                  d="M190 240c-18-34 6-72 40-82 25-7 45 8 58 29 10 16 10 33 2 49-8 18-21 29-40 33-22 4-50-1-60-29z"
                  fill="white"
                  fillOpacity="0.14"
                  stroke="white"
                  strokeOpacity="0.12"
                  strokeWidth="1"
                />
                <path
                  d="M320 140c30-55 92-76 145-52 44 20 72 61 65 101-8 42-42 75-90 86-54 12-120-10-140-56-12-28-12-52 20-79z"
                  fill="white"
                  fillOpacity="0.15"
                  stroke="white"
                  strokeOpacity="0.12"
                  strokeWidth="1"
                />
                <path
                  d="M520 120c44-38 115-39 158 6 33 35 38 86 6 126-30 38-86 62-136 50-45-11-85-49-82-98 2-31 16-53 54-84z"
                  fill="white"
                  fillOpacity="0.15"
                  stroke="white"
                  strokeOpacity="0.12"
                  strokeWidth="1"
                />
                <path
                  d="M650 300c22-28 62-38 97-28 30 9 48 33 40 63-8 31-40 55-79 55-38 0-74-19-79-52-3-16 5-26 21-38z"
                  fill="white"
                  fillOpacity="0.14"
                  stroke="white"
                  strokeOpacity="0.11"
                  strokeWidth="1"
                />
              </g>

              {/* Curved routes (animated on scroll via strokeDashoffset). */}
              {routeDefs.map((r) => (
                <path
                  key={r.key}
                  ref={(el) => {
                    routePathRefs.current[r.key] = el;
                  }}
                  d={r.d}
                  fill="none"
                  stroke="url(#routeStroke)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.9"
                  filter="url(#glow)"
                />
              ))}

              {/* Plane (single icon moving along the active route). */}
              <g
                ref={planeRef}
                style={{ opacity: 0 }}
                transform={`translate(${ORIGIN.x} ${ORIGIN.y}) rotate(0)`}
              >
                <polygon
                  points="0,-8 14,0 0,8 -10,0"
                  fill="#eab308"
                  opacity="0.95"
                />
              </g>

              {/* Origin marker (Pakistan). */}
              <g transform={`translate(${ORIGIN.x} ${ORIGIN.y})`}>
                <circle r="6" fill="#34d399" opacity="0.75" />
                <circle r="10" fill="#34d399" opacity="0.12" />
              </g>

              {/* Destination markers with hover + pulse. */}
              {DESTINATIONS.map((d) => (
                <g
                  key={d.key}
                  ref={(el) => {
                    markerGroupRefs.current[d.key] = el;
                  }}
                  transform={`translate(${d.x} ${d.y})`}
                  onPointerEnter={(e) => onMarkerEnter(d, e)}
                  onPointerMove={(e) => onMarkerMove(d, e)}
                  onPointerLeave={onMarkerLeave}
                  style={{ cursor: "pointer" }}
                  aria-label={d.name}
                  role="button"
                  tabIndex={-1}
                >
                  <circle r="14" fill="#fbbf24" opacity="0.12" />
                  <circle
                    ref={(el) => {
                      markerInnerRefs.current[d.key] = el;
                    }}
                    r="5"
                    fill="#fbbf24"
                    opacity="0.95"
                    filter="url(#glow)"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
