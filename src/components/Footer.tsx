import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink px-6 py-12 text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center text-sm">
        <span className="font-serif text-base tracking-[0.2em] text-mist">
          WG&nbsp;PARTNERS
        </span>
        <span>AI Modernization &amp; Legacy Systems Consulting</span>
        <span>
          <a href="mailto:roger@wgpartners.com" className="hover:text-mist">
            roger@wgpartners.com
          </a>{" "}
          ·{" "}
          <a href="tel:+19102970929" className="hover:text-mist">
            910-297-0929
          </a>
        </span>
        <Link href="/whitepapers" className="hover:text-mist">
          Whitepapers
        </Link>
      </div>
    </footer>
  );
}
