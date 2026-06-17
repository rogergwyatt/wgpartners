"use client";

import { useState } from "react";
import Link from "next/link";
import CTAButton from "./CTAButton";

const links = [
  { href: "/#saas-killer", label: "SaaS Killer" },
  { href: "/#whitepapers", label: "Whitepapers" },
  { href: "/#who-we-are", label: "Who We Are" },
  { href: "/#how-we-work", label: "How We Work" },
  { href: "/#contact", label: "Contact" },
];

const linkClass =
  "text-sm text-slate-300 hover:text-mist focus-visible:outline-none focus-visible:text-mist focus-visible:underline";

export default function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-[0.2em] text-mist"
        >
          WG&nbsp;AI&nbsp;PARTNERS
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <CTAButton href="/#contact">Book a 20-min call</CTAButton>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="border-t border-white/10 bg-navy px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <CTAButton href="/#contact">Book a 20-min call</CTAButton>
          </div>
        </div>
      )}
    </header>
  );
}
