"use client";

import { useLayoutEffect, useRef } from "react";
import gsap, { ScrollTrigger } from "../lib/gsap";

const TEAM = [
  {
    id: "muhammad-naveed",
    name: "Muhammad Naveed",
    role: "Co-founder / CEO",
    description:
      "Over 25 years experience in Pakistan's financial markets. Skilled in portfolio management, capital markets, risk management, and investments.",
    image: "/Ceo.jfif",
    variant: "person",
  },
];

export default function About() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const copyRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cards = cardRefs.current.filter(Boolean);

    if (prefersReducedMotion) {
      gsap.set([headingRef.current, copyRef.current, ...cards], {
        clearProps: "all",
      });
      return;
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const refreshTimer = window.setTimeout(refresh, 300);

    const ctx = gsap.context(() => {
      gsap.set(headingRef.current, { opacity: 0, y: 28 });
      gsap.set(copyRef.current, { opacity: 0, y: 22 });
      gsap.set(cards, { opacity: 0, y: 40 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          once: true,
        },
      });

      intro
        .to(headingRef.current, { opacity: 1, y: 0, duration: 0.75 })
        .to(copyRef.current, { opacity: 1, y: 0, duration: 0.65 }, "-=0.45")
        .to(
          cards,
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.16,
            ease: "power3.out",
          },
          "-=0.35",
        );

      intro.eventCallback("onComplete", () => {
        cards.forEach((card, i) => {
          gsap.to(card, {
            y: "+=6",
            duration: 2.4 + i * 0.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
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
      id="about"
      className="relative z-10 w-full scroll-mt-24 overflow-x-hidden bg-neutral-950 px-6 py-24 text-white sm:px-10 md:py-32 lg:px-16"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[420px] w-[min(100%,56rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.12),transparent_65%)]" />
        <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-amber-500/8 blur-[100px]" />
        {/* Warm wash toward bottom so flow into Catalogue feels like one canvas */}
        <div className="absolute inset-x-0 bottom-0 h-[min(55%,28rem)] bg-[linear-gradient(to_top,rgba(249,115,22,0.07),rgba(251,191,36,0.04),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_top,rgba(0,0,0,0.45),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-400/90">
            RipesFoods People
          </p>
          <h2
            ref={headingRef}
            className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
          >
            OUR CORE TEAM
          </h2>
          <p
            ref={copyRef}
            className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg"
          >
            Import &amp; export is only as strong as the people behind it. We
            combine sourcing discipline, risk-aware decision making, and
            operations excellence to move agricultural goods to partners
            worldwide.
          </p>
        </header>

        <div className="mt-14 flex justify-center lg:mt-16 ">
          {TEAM.map((member, index) => (
            <article
              key={member.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-about-card
              data-member-id={member.id}
              className="group relative w-full max-w-md rounded-2xl border border-white/10 bg-white/4 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-[transform,box-shadow] duration-300 ease-out hover:scale-[1.02] hover:border-emerald-400/25 hover:shadow-[0_20px_60px_-20px_rgba(52,211,153,0.25)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-r from-emerald-400/10 via-amber-300/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <div className="relative mx-auto mb-5 aspect-3/4 w-full max-w-[280px] overflow-hidden rounded-xl sm:aspect-4/5 sm:max-w-[300px] md:aspect-square md:max-w-none">
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06] group-hover:rotate-[0.6deg]"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-80" />
              </div>
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                {member.role}
              </p>
              <h3 className="mt-2 text-center text-xl font-semibold tracking-tight sm:text-2xl transition-colors duration-300 group-hover:text-white">
                {member.name}
              </h3>
              <p className="mt-3 text-center text-sm leading-relaxed text-white/65 sm:text-[0.95rem]">
                {member.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
