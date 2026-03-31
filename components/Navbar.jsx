"use client";

import { useCallback, useEffect, useState } from "react";

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "products", label: "Products" },
  { id: "process", label: "Process" },
  { id: "global-reach", label: "Global reach" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setOpen(false);
  }, []);

  const onLinkClick = useCallback(
    (e, id) => {
      e.preventDefault();
      goTo(id);
    },
    [goTo],
  );

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-100 px-3 pt-3 sm:px-4 sm:pt-4 md:flex md:justify-center ${
          scrolled ? "" : ""
        }`}
      >
        <nav
          aria-label="Main"
          className={`mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl  px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
            scrolled
              ? " bg-black/55 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              : " bg-black/35 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.6)] backdrop-blur-md"
          }`}
        >
          <a
            href="/"
            onClick={(e) => onLinkClick(e, "home")}
            className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg pr-1"
          >
            <img
              src="/logoripes.png"
              alt="RipesFood"
              width={180}
              height={180}
              loading="eager"
            />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => onLinkClick(e, item.id)}
                  className="group relative px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className="absolute inset-x-2 bottom-1.5 h-px origin-center scale-x-0 bg-linear-to-r from-transparent via-emerald-400 to-transparent transition-transform duration-300 ease-out group-hover:scale-x-100"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              onClick={(e) => onLinkClick(e, "contact")}
              className="hidden rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition-[background-color,box-shadow] hover:bg-white/12 hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.35)] sm:inline-block"
            >
              Get in touch
            </a>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 top-[3px] block h-0.5 w-full rounded-full bg-white transition duration-200 ${
                    open ? "top-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] block h-0.5 w-full rounded-full bg-white transition-opacity duration-200 ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[11px] block h-0.5 w-full rounded-full bg-white transition duration-200 ${
                    open ? "top-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-nav"
        className={`fixed inset-0 z-90 bg-black/65 backdrop-blur-sm transition-opacity lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <div
        className={`fixed left-0 right-0 top-19 z-95 mx-3 rounded-2xl border border-white/10 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-xl transition-[opacity,transform] duration-200 ease-out lg:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block rounded-xl px-4 py-3 text-base font-medium text-white/90 transition-colors hover:bg-white/5 hover:text-emerald-400"
                onClick={(e) => onLinkClick(e, item.id)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="mt-3 block w-full rounded-xl bg-linear-to-r from-emerald-500/20 to-amber-500/15 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/10"
          onClick={(e) => onLinkClick(e, "contact")}
        >
          Get in touch
        </a>
      </div>
    </>
  );
}
