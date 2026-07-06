import Link from "next/link";
import Section from "./Section";
import CTAButton from "./CTAButton";

const drains = [
  {
    title: "Aging Custom Code",
    points: [
      "Built years ago — nobody fully understands it anymore.",
      "Developers are afraid to touch it; every change is a risk.",
      "Maintenance costs climb 10–15% every year.",
      "Blocks your ability to integrate modern tools or AI.",
      "Modernization quotes from the big firms: $5M–$30M+.",
    ],
  },
  {
    title: "Off-the-Shelf SaaS",
    points: [
      "Annual maintenance & licensing fees that never stop.",
      "You pay every year — but you'll never own anything.",
      "The vendor raises prices; you have no leverage.",
      "Forced upgrades break your workflows.",
      "Generic features that don't fit your exact business.",
    ],
  },
];

const trap = [
  {
    n: "01",
    title: "The Pricing Extortion Loop",
    body: "Introductory pricing gives way to forced tier migrations, infrastructure restructurings, and unbundled feature gates. You pay the annual ~15% tax because tearing out your core pipeline feels impossible.",
  },
  {
    n: "02",
    title: "Feature Deprivation",
    body: "Multi-tenant vendors build to capture their next 100 clients, not to serve you. Your engineering requests rot at the bottom of a public backlog for 18 months.",
  },
  {
    n: "03",
    title: "The Custom Middleware Prison",
    body: "To bend a generic app to your business logic, your team writes brittle middleware. When the provider pushes a breaking API change, operations break — and you fix code you don't even own.",
  },
];

export default function SaaSKiller() {
  return (
    <Section id="saas-killer" className="bg-navy text-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
        The End of Software Rental
      </p>
      <h2 className="mt-3 font-serif text-3xl font-bold lg:text-4xl">
        Every year, enterprises pay 15–20% more for software they don&rsquo;t
        own, can&rsquo;t control, and can&rsquo;t leave.
      </h2>

      <h3 className="mt-14 text-xl font-semibold text-slate-200">
        Two ways software is draining you right now
      </h3>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {drains.map((d) => (
          <div key={d.title} className="rounded-xl bg-white/5 p-6">
            <h4 className="font-serif text-xl font-bold text-gold">{d.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {d.points.map((p) => (
                <li key={p}>— {p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-400">
        Enterprises spend 60–80% of their IT budget just maintaining the above —
        leaving almost nothing for growth.
      </p>

      <h3 className="mt-16 text-xl font-semibold text-slate-200">
        The SaaS Hostage Trap
      </h3>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {trap.map((t) => (
          <div key={t.n} className="rounded-xl border border-white/10 p-6">
            <div className="font-serif text-3xl font-extrabold text-gold">
              {t.n}
            </div>
            <h4 className="mt-3 font-semibold">{t.title}</h4>
            <p className="mt-2 text-sm text-slate-300">{t.body}</p>
          </div>
        ))}
      </div>

      <blockquote className="mt-16 border-l-2 border-gold pl-6 font-serif text-2xl italic leading-snug text-slate-100">
        Multi-billion-dollar SaaS companies selling the same generic code to
        every customer are the modern equivalent of buggy-whip manufacturers —
        selling horseshoes in an era that just invented the engine.
      </blockquote>
      <p className="mt-4 text-sm text-slate-400">
        The historical value of software was labor scarcity. Today, syntax
        generation is a free commodity.
      </p>

      <h3 className="mt-16 font-serif text-2xl font-bold lg:text-3xl">
        The specification is the asset. Code is disposable.
      </h3>
      <p className="mt-2 text-slate-300">Generation over configuration.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-6">
          <h4 className="font-semibold text-slate-200">
            Monolith lock-in (today)
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>— Manual code review gates every deployment.</li>
            <li>— The vendor controls your roadmap and upgrade schedule.</li>
            <li>— Brittle middleware breaks on unannounced API changes.</li>
            <li>— Switching costs compound with every integration.</li>
            <li>— You never own what you paid to build.</li>
          </ul>
        </div>
        <div className="rounded-xl bg-gold/10 p-6 ring-1 ring-gold/30">
          <h4 className="font-semibold text-gold">Spec-driven generation</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li>— A precise, machine-readable behavioral specification.</li>
            <li>— Standard connectors — swap Stripe/Plaid/Twilio in minutes.</li>
            <li>
              — Automated verification: AI writes code in a sandbox, slammed
              against regression tests; deviate by one byte → rejected.
            </li>
            <li className="font-semibold text-gold">Pay once. Own forever.</li>
          </ul>
        </div>
      </div>

      <div className="mt-16 rounded-xl bg-ink p-8">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
          The proof — we&rsquo;ve already done it
        </p>
        <p className="mt-4 text-2xl font-bold">
          <span className="text-gold">40×</span> compression in engineering
          delivery.
        </p>
        <p className="mt-3 text-slate-300">
          In a single weekend we built a full production-ready e-commerce
          platform from scratch — payments, inventory, shipping APIs, and an
          admin dashboard. What traditionally required six weeks of boilerplate
          engineering took under six hours of AI orchestration.
        </p>
        <p className="mt-4">
          <Link
            href="/proof-of-capability"
            className="text-sm font-semibold text-gold hover:underline"
          >
            See the full proof of capability &rarr;
          </Link>
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <p className="text-slate-300">
          Put a number on it — see what an agent running one workflow forever
          actually costs versus software you own.
        </p>
        <CTAButton href="/calculator">Try the Agent Tax Calculator &rarr;</CTAButton>
      </div>
    </Section>
  );
}
