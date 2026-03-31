const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#products", label: "Products" },
  { href: "#process", label: "Process" },
  { href: "#global-reach", label: "Global reach" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="relative z-10 scroll-mt-24 border-t border-white/10 bg-neutral-950 text-white"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="text-lg font-semibold tracking-tight">RipesFood</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
              Premium import &amp; export of fruits, vegetables, grains, and
              pulses—quality sourcing and reliable delivery worldwide.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
              Quick links
            </p>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-emerald-400"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href="mailto:hello@ripesfood.com"
                  className="transition-colors hover:text-white"
                >
                  hello@ripesfood.com
                </a>
              </li>
              <li>
                <span className="text-white/50">Business inquiries</span>
                <br />
                <a
                  href="mailto:trade@ripesfood.com"
                  className="transition-colors hover:text-white"
                >
                  trade@ripesfood.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/45">
            © {year} RipesFood. All rights reserved.
          </p>
          <p className="text-xs text-white/45">
            Export-grade agricultural products · Global logistics
          </p>
        </div>
      </div>
    </footer>
  );
}
