import type { Metadata } from "next";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";

export const metadata: Metadata = {
  title: "Proof of Capability | WG AI Partners",
  description:
    "What we do. What we've proven. What it means for you. Two controlled proofs: a SaaS platform replaced in 6 hours, and business logic extracted from a live app with zero source code access.",
  alternates: { canonical: "/proof-of-capability" },
};

const poc1Stats = [
  { figure: "6 hrs", label: "Build Time — concept to working replacement" },
  { figure: "$1,200", label: "Build Cost — at consulting rates" },
  { figure: "$299/mo", label: "Eliminated — immediate monthly savings" },
  { figure: "< 4 mo", label: "Payback — break-even on build cost" },
];

const poc2Stats = [
  { figure: "3 hrs", label: "Extraction Time — business rules from live app" },
  { figure: "Zero", label: "Source Code Access — no code, no API, no docs" },
  { figure: "100%", label: "Logic Captured — core workflows documented" },
  { figure: "1", label: "New Stack — different language, same capability" },
];

function StatBand({ stats }: { stats: { figure: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 divide-y divide-white/10 rounded-xl bg-ink lg:grid-cols-4 lg:divide-x lg:divide-y-0">
      {stats.map((s) => (
        <div key={s.label} className="px-5 py-7 text-center">
          <div className="font-serif text-3xl font-extrabold text-gold">
            {s.figure}
          </div>
          <div className="mt-2 text-xs text-slate-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProofOfCapabilityPage() {
  return (
    <>
      <TopNav />
      <main className="bg-mist">
        <div className="bg-gradient-to-b from-navy to-navy-700 px-6 py-20 text-center lg:py-28">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto mb-6 h-[3px] w-14 bg-gold" />
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
              Proof of Capability
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-mist lg:text-5xl">
              What we do. What we&rsquo;ve proven.{" "}
              <span className="text-gold">What it means for you.</span>
            </h1>
          </div>
        </div>

        <Section className="bg-mist">
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
            The Argument
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy lg:text-4xl">
            You don&rsquo;t have a software problem. You have an ownership
            problem.
          </h2>
          <p className="mt-6 text-slate-700">
            Every SaaS contract you sign is a decision to rent your own
            business logic. The vendor holds the specification &mdash; the
            rules, the workflows, the decisions that make your business run
            &mdash; and charges you indefinitely for access to it. When they
            raise prices, you pay. When they deprecate features, you adapt.
            When you want to leave, you discover how hard they&rsquo;ve made
            it.
          </p>
          <p className="mt-4 text-slate-700">
            The code is not the asset. The specification is. Once you own the
            specification, you own the capability &mdash; permanently, at
            cost, without a renewal conversation.
          </p>
        </Section>

        <Section className="bg-navy text-mist">
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
            What We Do
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold lg:text-4xl">
            We extract your business logic and build you out of the rental
            market.
          </h2>
          <p className="mt-6 text-slate-300">
            WG AI Partners works with mid-market companies paying $50,000 or
            more annually in SaaS costs they could eliminate. We use
            AI-assisted reverse engineering to extract the business rules
            embedded in your current systems &mdash; whether you own the
            source code or not &mdash; document them as a durable
            specification, and replace the tool with a custom-built
            capability your company owns outright.
          </p>
          <p className="mt-4 text-slate-300">
            The result: no renewal conversations. No price increases. No
            vendor who knows leaving feels impossible.
          </p>
        </Section>

        <Section className="bg-mist">
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
            Proof of Concept
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy lg:text-4xl">
            We didn&rsquo;t theorize this. We proved it.
          </h2>
          <p className="mt-4 text-slate-700">
            Before asking any client to trust the methodology, we ran two
            controlled proofs to answer the hard questions first.
          </p>

          <div className="mt-14">
            <h3 className="font-serif text-xl font-bold text-navy">
              POC 1 &mdash; E-Commerce Platform Replacement
            </h3>
            <p className="mt-2 text-slate-700">
              The question: Can a production SaaS platform be replaced faster
              than a traditional development cycle, at a fraction of the
              ongoing cost?
            </p>
            <div className="mt-6">
              <StatBand stats={poc1Stats} />
            </div>
            <p className="mt-6 text-slate-700">
              The replacement handles everything the SaaS platform handled
              &mdash; at zero monthly cost, on infrastructure the business
              controls. As the business scales the savings compound: the same
              capability costs $2,300/month to rent at scale. The replacement
              costs the same to run either way.
            </p>
          </div>

          <div className="mt-16">
            <h3 className="font-serif text-xl font-bold text-navy">
              POC 2 &mdash; Business Logic Extraction Without Source Code
            </h3>
            <p className="mt-2 text-slate-700">
              The question: Can we extract business rules from a SaaS
              application we don&rsquo;t own, have no access to, and
              can&rsquo;t inspect &mdash; then rebuild its core capability in
              a different technology stack?
            </p>
            <p className="mt-3 text-slate-700">
              This is the objection every IT leader raises: &ldquo;Our
              systems are too proprietary. Too complex. We couldn&rsquo;t
              rebuild them even if we wanted to.&rdquo; We built this proof
              specifically to answer that objection.
            </p>
            <div className="mt-6">
              <StatBand stats={poc2Stats} />
            </div>
            <p className="mt-6 text-slate-700">
              Using AI agents to observe application behavior, we extracted
              the complete business rule set from a live SaaS platform with
              no access to the underlying code, and rebuilt its core
              capability in a modern stack in under three hours. The
              specification, once documented, belongs to whoever commissioned
              the work.
            </p>
          </div>
        </Section>

        <Section className="bg-navy text-mist">
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
            What This Means For You
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold lg:text-4xl">
            A first engagement is designed to be low-risk and fast.
          </h2>
          <p className="mt-6 text-slate-300">
            We scope first engagements around a single SaaS tool or
            capability &mdash; 30 to 60 days, fixed scope, clear deliverable.
            You walk away with:
          </p>
          <ul className="mt-4 space-y-2 text-slate-300">
            <li>&mdash; A documented specification of the business logic you currently rent.</li>
            <li>&mdash; A working replacement your company owns outright.</li>
            <li>&mdash; A clear picture of what the rest of your SaaS stack would cost to eliminate.</li>
          </ul>
          <p className="mt-6 text-slate-300">
            If the engagement delivers value, the next conversation is
            obvious. If it doesn&rsquo;t, you&rsquo;ve spent 30 to 60 days and
            have a specification you own regardless.
          </p>
          <div className="mt-10 flex justify-center">
            <CTAButton href="/#contact">Book a 20-min call &rarr;</CTAButton>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
