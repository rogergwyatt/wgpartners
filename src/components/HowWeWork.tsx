import Section from "./Section";
import CTAButton from "./CTAButton";

const principles = [
  "Senior people deliver — always.",
  "Fixed-price outcomes, not hours.",
  "You own the IP outright.",
  "No recurring fees, ever.",
];

const phases = [
  { name: "Discovery & Architecture", body: "We audit the legacy system and lock down its true behavioral specification." },
  { name: "Build & Integrate", body: "AI-assisted development against the spec, with weekly demos and integration into your stack." },
  { name: "Deploy, Transition & Handover", body: "Production deployment, knowledge transfer, and full IP assignment. You get the keys." },
];

export default function HowWeWork() {
  return (
    <Section id="how-we-work" className="bg-navy text-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
        How We Work
      </p>
      <h2 className="mt-3 font-serif text-3xl font-bold lg:text-4xl">
        We hand you the keys. When you&rsquo;re ready to add a room, we&rsquo;re
        your team.
      </h2>

      <div className="mt-8 flex flex-wrap gap-3">
        {principles.map((p) => (
          <span
            key={p}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200"
          >
            {p}
          </span>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {phases.map((ph, i) => (
          <div key={ph.name} className="rounded-xl bg-white/5 p-6">
            <div className="font-serif text-2xl font-extrabold text-gold">
              {i + 1}
            </div>
            <h3 className="mt-2 font-semibold">{ph.name}</h3>
            <p className="mt-2 text-sm text-slate-300">{ph.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-gold/10 p-8 ring-1 ring-gold/30">
        <h3 className="font-serif text-2xl font-bold text-gold">
          A 30–60 day test project
        </h3>
        <p className="mt-2 text-slate-200">
          Isolate → Specify → Deliver. We prove the model on one of your real
          systems in 30–60 days — working code you own — before any larger
          commitment.
        </p>
      </div>

      <div className="mt-12 text-center">
        <p className="mx-auto max-w-xl text-lg text-slate-200">
          Tell us what you&rsquo;re running. We&rsquo;ll tell you if we can help.
          20 minutes. No pitch. Just questions.
        </p>
        <div className="mt-6">
          <CTAButton href="/#contact">Book a 20-min call &rarr;</CTAButton>
        </div>
      </div>
    </Section>
  );
}
