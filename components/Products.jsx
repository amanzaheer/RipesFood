"use client";

import { useLayoutEffect, useRef } from "react";
import gsap, { ScrollTrigger } from "../lib/gsap";

const PRODUCTS = [
  {
    id: "fruits",
    title: "Fruits",
    image: "/fruits.avif",
    modelPath: null,
  },
  {
    id: "vegetables",
    title: "Vegetables",
    image: "/vegetables.avif",
    modelPath: null,
  },
  {
    id: "grains",
    title: "Grains",
    image: "/grains.avif",
    modelPath: null,
  },
  {
    id: "pulses",
    title: "Pulses",
    image:
      "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    modelPath: null,
  },
];

export default function Products() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const introRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cards = cardRefs.current.filter(Boolean);

    if (prefersReducedMotion) {
      gsap.set([headingRef.current, introRef.current, ...cards], {
        clearProps: "all",
      });
      return;
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const refreshTimer = window.setTimeout(refresh, 400);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            once: true,
          },
        },
      );
      gsap.fromTo(
        introRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        },
      );

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              once: true,
            },
          },
        );
      });
    }, section);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="products"
      className="relative z-10 w-full scroll-mt-24 overflow-x-hidden bg-neutral-950 px-6 pt-16 pb-24 text-white sm:px-10 md:pt-20 md:pb-32 lg:px-16"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[min(42%,22rem)] bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,rgba(52,211,153,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(249,115,22,0.14),transparent_40%),radial-gradient(circle_at_85%_72%,rgba(34,197,94,0.12),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_45%,rgba(0,0,0,0.15))]" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.07]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] lg:gap-20">
          <header className="lg:sticky lg:top-24">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-orange-300/90">
              Catalogue
            </p>
            <h2
              ref={headingRef}
              className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.9rem] lg:leading-tight"
            >
              High-Quality Import &amp; Export Products
            </h2>
            <p
              ref={introRef}
              className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg"
            >
              We deliver premium fruits, vegetables, grains, and pulses with
              strict quality control, reliable sourcing, and trusted global
              import-export operations.
            </p>
          </header>

          <div className="space-y-14 lg:space-y-20">
            {PRODUCTS.map((product, index) => (
              <article
                key={product.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="group relative"
                data-product-id={product.id}
                data-model-path={product.modelPath ?? ""}
              >
                <div className="absolute -left-3 top-4 text-6xl font-bold tracking-tight text-white/10 sm:-left-6 sm:text-7xl">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-white/15 bg-white/4 shadow-[0_24px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-300 ease-out group-hover:border-white/22 group-hover:bg-white/[0.06] group-hover:shadow-[0_28px_90px_-28px_rgba(0,0,0,0.75)]">
                  <div className="grid w-full min-h-0 gap-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-stretch md:h-[clamp(18rem,42vw,22rem)]">
                    <div className="relative aspect-16/10 w-full min-h-0 shrink-0 overflow-hidden md:aspect-auto md:h-full">
                      <img
                        src={product.image}
                        alt={product.title}
                        loading={index < 2 ? "eager" : "lazy"}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      />
                      <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-black/55 via-black/5 to-transparent" />
                    </div>

                    <div className="relative z-20 flex min-h-0 min-w-0 flex-col justify-center px-6 py-7 sm:px-7 sm:py-8 md:h-full md:overflow-y-auto">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                        Export Grade
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight transition-colors duration-300 sm:text-3xl group-hover:text-orange-50/95">
                        {product.title}
                      </h3>
                      <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70 transition-colors duration-300 group-hover:text-white/80">
                        High-quality sourcing, careful handling, and reliable
                        global shipping with premium standards.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
