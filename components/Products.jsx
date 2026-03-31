"use client";

import { useLayoutEffect, useRef } from "react";
import gsap, { ScrollTrigger } from "../lib/gsap";

const PRODUCTS = [
  {
    id: "fruits",
    title: "Fruits",
    image: "/fruits.avif",
    modelPath: null,
    accent: "from-orange-500/35 via-amber-400/20 to-transparent",
    lightning:
      "conic-gradient(from 0deg, transparent 0deg 252deg, rgba(253, 230, 138, 0.95) 262deg, rgba(255, 255, 255, 1) 274deg, rgba(255, 210, 150, 1) 284deg, rgba(249, 115, 22, 1) 292deg, rgba(251, 191, 36, 0.9) 302deg, transparent 318deg)",
  },
  {
    id: "vegetables",
    title: "Vegetables",
    image: "/vegetables.avif",
    modelPath: null,
    accent: "from-emerald-500/35 via-green-400/20 to-transparent",
    lightning:
      "conic-gradient(from 0deg, transparent 0deg 252deg, rgba(167, 243, 208, 0.95) 262deg, rgba(255, 255, 255, 1) 274deg, rgba(110, 231, 183, 1) 284deg, rgba(52, 211, 153, 1) 292deg, rgba(16, 185, 129, 0.9) 302deg, transparent 318deg)",
  },
  {
    id: "grains",
    title: "Grains",
    image: "/grains.avif",
    modelPath: null,
    accent: "from-yellow-500/35 via-amber-300/20 to-transparent",
    lightning:
      "conic-gradient(from 0deg, transparent 0deg 252deg, rgba(254, 240, 138, 1) 262deg, rgba(255, 255, 255, 1) 274deg, rgba(250, 204, 21, 1) 284deg, rgba(234, 179, 8, 1) 292deg, rgba(245, 158, 11, 0.95) 302deg, transparent 318deg)",
  },
  {
    id: "pulses",
    title: "Pulses",
    image:
      "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    modelPath: null,
    accent: "from-rose-500/35 via-orange-300/20 to-transparent",
    lightning:
      "conic-gradient(from 0deg, transparent 0deg 252deg, rgba(254, 205, 211, 0.95) 262deg, rgba(255, 255, 255, 1) 274deg, rgba(251, 113, 133, 1) 284deg, rgba(251, 146, 60, 1) 292deg, rgba(249, 115, 22, 0.92) 302deg, transparent 318deg)",
  },
];

export default function Products() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const introRef = useRef(null);
  const railRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cards = cardRefs.current.filter(Boolean);

    if (prefersReducedMotion) {
      gsap.set(
        [headingRef.current, introRef.current, railRef.current, ...cards],
        {
          clearProps: "all",
        },
      );
      return;
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const refreshTimer = window.setTimeout(refresh, 400);

    const ctx = gsap.context(() => {
      gsap.set(headingRef.current, { opacity: 0, y: 24 });
      gsap.set(introRef.current, { opacity: 0, y: 20 });
      gsap.set(railRef.current, { scaleY: 0, transformOrigin: "top center" });

      const introTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 55%",
          scrub: 0.6,
        },
      });

      introTl
        .to(headingRef.current, { opacity: 1, y: 0, duration: 1 })
        .to(introRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.65")
        .to(railRef.current, { scaleY: 1, duration: 1 }, "-=0.65");

      cards.forEach((card, index) => {
        const shell = card.querySelector("[data-card-shell]");
        const glow = card.querySelector("[data-card-glow]");
        const img = card.querySelector("[data-card-image]");
        const fromLeft = index % 2 === 0;
        if (!shell || !glow || !img) return;

        gsap.set(shell, {
          opacity: 0.2,
          xPercent: fromLeft ? -18 : 18,
          yPercent: 36,
          rotationX: 52,
          rotationY: fromLeft ? -22 : 22,
          z: -140,
          scale: 0.82,
          transformPerspective: 1400,
          transformOrigin: "50% 100%",
        });

        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 95%",
            end: "top 48%",
            scrub: 0.95,
          },
        });

        cardTl
          .to(shell, {
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            rotationX: 0,
            rotationY: 0,
            z: 0,
            scale: 1,
            ease: "none",
          })
          .to(
            glow,
            {
              opacity: 1,
              ease: "none",
            },
            0,
          )
          .to(
            img,
            {
              scale: 1.08,
              ease: "none",
            },
            0,
          );

        gsap.to(shell, {
          y: -28,
          scrollTrigger: {
            trigger: card,
            start: "top 72%",
            end: "bottom top",
            scrub: 1.25,
          },
        });

        gsap.to(shell, {
          rotationY: fromLeft ? 14 : -14,
          rotationX: 8,
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.45,
          },
        });

        gsap.to(glow, {
          opacity: 0.55,
          scrollTrigger: {
            trigger: card,
            start: "top 70%",
            end: "bottom top",
            scrub: 1,
          },
        });
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
        {/* Echo About’s emerald wash at top so the seam disappears */}
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

          <div className="space-y-14 perspective-[1600px] lg:space-y-20">
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

                <div
                  className="product-card-border-track product-card-drift shadow-[0_0_55px_-18px_rgba(249,115,22,0.28)]"
                  style={{ animationDelay: `${index * 0.65}s` }}
                >
                  <div
                    className="product-border-lightning-halo product-border-lightning-anim-reverse pointer-events-none"
                    aria-hidden
                    style={{
                      background: product.lightning,
                      animationDuration: `${8.5 + index * 0.55}s`,
                      animationDelay: `${-index * 2.2}s`,
                    }}
                  />
                  <div
                    className="product-border-lightning-layer product-border-lightning-anim pointer-events-none"
                    aria-hidden
                    style={{
                      background: product.lightning,
                      animationDuration: `${4.25 + index * 0.35}s`,
                      animationDelay: `${-index * 1.1}s`,
                    }}
                  />
                  <div
                    data-card-shell
                    className="relative z-10 m-[5px] overflow-hidden rounded-[calc(1.5rem-5px)] border border-white/18 bg-white/[0.04] shadow-[0_24px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm transform-3d transition-[border-color,box-shadow,background-color] duration-500 ease-out group-hover:border-white/28 group-hover:bg-white/[0.07] group-hover:shadow-[0_32px_100px_-28px_rgba(249,115,22,0.18),0_24px_80px_-30px_rgba(0,0,0,0.75)]"
                  >
                    <div
                      data-card-glow
                      className={`pointer-events-none absolute inset-0 z-10 bg-linear-to-br ${product.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
                    <div className="relative aspect-16/10 overflow-hidden md:aspect-auto">
                      <div
                        data-card-image-wrap
                        className={
                          index % 2 === 0
                            ? "absolute inset-0 origin-center [transform-style:preserve-3d] animate-product-image-breathe transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:[transform:perspective(1100px)_rotateX(2.2deg)_rotateY(-3deg)_scale(1.05)] group-hover:[animation-play-state:paused]"
                            : "absolute inset-0 origin-center [transform-style:preserve-3d] animate-product-image-breathe transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:[transform:perspective(1100px)_rotateX(2.2deg)_rotateY(3deg)_scale(1.05)] group-hover:[animation-play-state:paused]"
                        }
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          data-card-image
                          loading={index < 2 ? "eager" : "lazy"}
                          className="h-full w-full object-cover transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:brightness-[1.06] group-hover:contrast-[1.03]"
                        />
                      </div>
                      <div className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-t from-black/55 via-black/5 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                    </div>

                    <div className="relative z-20 flex flex-col justify-center px-6 py-7 sm:px-7 sm:py-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                        Export Grade
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight transition-colors duration-500 sm:text-3xl group-hover:text-orange-50/95">
                        {product.title}
                      </h3>
                      <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/80">
                        High-quality sourcing, careful handling, and reliable
                        global shipping with premium standards.
                      </p>
                    </div>
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
