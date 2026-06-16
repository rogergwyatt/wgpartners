import Link from "next/link";
import CTAButton from "./CTAButton";

const links = [
  { href: "/#saas-killer", label: "SaaS Killer" },
  { href: "/#whitepapers", label: "Whitepapers" },
  { href: "/#who-we-are", label: "Who We Are" },
  { href: "/#how-we-work", label: "How We Work" },
  { href: "/#contact", label: "Contact" },
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-[0.2em] text-mist"
        >
          WG&nbsp;PARTNERS
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-300 hover:text-mist"
            >
              {l.label}
            </Link>
          ))}
          <CTAButton href="/#contact">Book a 20-min call</CTAButton>
        </div>
        <div className="lg:hidden">
          <CTAButton href="/#contact">Book a call</CTAButton>
        </div>
      </nav>
    </header>
  );
}
